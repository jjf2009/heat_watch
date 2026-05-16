"use client";
import { useState, useEffect } from "react";
import axios from "axios";

type Props = {
  currentUHI: number;
  lat: number;
  lng: number;
  city: string;
};

type Intervention = {
  treeCoverIncrease: number;
  reflectiveSurfaces: number;
  waterBodies: number;
  greenRoofs: number;
};

type SimResult = {
  totalCooling: number;
  projectedUHI: number;
  breakdown: {
    treeCooling: number;
    reflectiveCooling: number;
    waterCooling: number;
    greenRoofCooling: number;
  };
  costEstimate: {
    trees: number;
    reflective: number;
    water: number;
    greenRoofs: number;
  };
};

export default function InterventionSimulator({ currentUHI, lat, lng, city }: Props) {
  const [interventions, setInterventions] = useState<Intervention>({
    treeCoverIncrease: 10,
    reflectiveSurfaces: 20,
    waterBodies: 2,
    greenRoofs: 10,
  });
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced simulation — recalculates 400ms after slider stops
  useEffect(() => {
    const timer = setTimeout(() => simulate(), 400);
    return () => clearTimeout(timer);
  }, [interventions]);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/uhi-engine", {
        lat, lng,
        city,
        interventions,
      });
      setResult(res.data.interventionResult);
    } catch {}
    setLoading(false);
  };

  const totalCost = result
    ? Object.values(result.costEstimate).reduce((a, b) => a + b, 0)
    : 0;

  const projectedRiskLevel = result
    ? result.projectedUHI >= 4 ? "High" : result.projectedUHI >= 2 ? "Medium" : "Low"
    : null;

  const riskColors = { High: "#ef4444", Medium: "#f97316", Low: "#22c55e" };

  const sliders = [
    {
      key: "treeCoverIncrease" as keyof Intervention,
      label: "Tree Canopy Increase",
      unit: "%",
      min: 0, max: 50, step: 5,
      icon: "🌳",
      description: "Bowler et al. (2010): -0.4°C per 10% increase",
    },
    {
      key: "reflectiveSurfaces" as keyof Intervention,
      label: "Reflective Roofs & Roads",
      unit: "%",
      min: 0, max: 100, step: 10,
      icon: "🏗️",
      description: "EPA Cool Roofs: -0.2°C per 20% coverage",
    },
    {
      key: "waterBodies" as keyof Intervention,
      label: "Water Features Added",
      unit: "ha",
      min: 0, max: 10, step: 1,
      icon: "💧",
      description: "Evaporative cooling: -0.3°C per hectare",
    },
    {
      key: "greenRoofs" as keyof Intervention,
      label: "Green Roof Coverage",
      unit: "%",
      min: 0, max: 50, step: 5,
      icon: "🌿",
      description: "Building coverage: -0.1°C per 10%",
    },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif font-bold text-lg text-[var(--foreground)]">🧪 Intervention Simulator</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Model policy decisions before committing budget — adjust sliders to see projected UHI reduction
          </p>
        </div>
        {loading && (
          <div className="w-5 h-5 border-2 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Sliders */}
        <div className="flex flex-col gap-6">
          {sliders.map(({ key, label, unit, min, max, step, icon, description }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {icon} {label}
                </span>
                <span className="text-sm font-bold text-white bg-[var(--accent-fire)] bg-opacity-20 px-2 py-0.5 rounded-lg border border-[var(--accent-fire)] border-opacity-40">
                  {interventions[key]} {unit}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={interventions[key]}
                onChange={(e) =>
                  setInterventions({ ...interventions, [key]: +e.target.value })
                }
                className="w-full h-2 cursor-pointer accent-[var(--accent-fire)]"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
            </div>
          ))}
        </div>

        {/* RIGHT — Results */}
        <div className="flex flex-col gap-4">

          {/* Before / After comparison */}
          <div className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
              UHI Intensity Comparison
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Current</p>
                <p className="text-3xl font-bold text-[var(--accent-danger)]">
                  {currentUHI > 0 ? '+' : ''}{currentUHI.toFixed(1)}°C
                </p>
                <p className="text-xs text-[var(--text-muted)]">vs rural baseline</p>
              </div>
              <div className="text-2xl text-[var(--border)]">→</div>
              <div className="flex-1 text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Projected</p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: result ? riskColors[projectedRiskLevel as keyof typeof riskColors] : "var(--text-muted)" }}
                >
                  {result ? `${result.projectedUHI > 0 ? '+' : ''}${result.projectedUHI.toFixed(1)}°C` : "—"}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {result ? `${projectedRiskLevel} risk` : "adjust sliders"}
                </p>
              </div>
            </div>

            {result && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
                <p className="text-sm font-semibold text-[var(--accent-cool)]">
                  Total reduction: -{result.totalCooling.toFixed(2)}°C
                </p>
              </div>
            )}
          </div>

          {/* Cooling breakdown */}
          {result && (
            <div className="bg-[var(--surface-light)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
                Cooling Breakdown
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Tree canopy", val: result.breakdown.treeCooling, color: "#22c55e" },
                  { label: "Reflective surfaces", val: result.breakdown.reflectiveCooling, color: "#3b82f6" },
                  { label: "Water features", val: result.breakdown.waterCooling, color: "#06b6d4" },
                  { label: "Green roofs", val: result.breakdown.greenRoofCooling, color: "#84cc16" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] w-36">{label}</span>
                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (val / result.totalCooling) * 100)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--foreground)] w-14 text-right">
                      -{val.toFixed(2)}°C
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost estimate */}
          {result && (
            <div className="bg-[rgba(247,147,30,0.15)] border border-[rgba(247,147,30,0.3)] rounded-xl p-4">
              <p className="text-xs font-bold text-white opacity-80 uppercase tracking-wide mb-2">
                Estimated Implementation Cost
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tree planting", val: result.costEstimate.trees },
                  { label: "Reflective coating", val: result.costEstimate.reflective },
                  { label: "Water features", val: result.costEstimate.water },
                  { label: "Green roofs", val: result.costEstimate.greenRoofs },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-xs text-white opacity-70">{label}</p>
                    <p className="text-sm font-bold text-white">
                      ₹{(val / 100000).toFixed(1)}L
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white border-opacity-20 flex justify-between">
                <span className="text-sm font-medium text-white opacity-80">Total Budget</span>
                <span className="text-sm font-bold text-white">
                  ₹{(totalCost / 10000000).toFixed(2)} Cr
                </span>
              </div>
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={() => setInterventions({ treeCoverIncrease: 0, reflectiveSurfaces: 0, waterBodies: 0, greenRoofs: 0 })}
            className="text-sm text-[var(--text-muted)] underline underline-offset-2 text-center hover:text-[var(--foreground)]"
          >
            Reset all interventions
          </button>
        </div>
      </div>
    </div>
  );
}

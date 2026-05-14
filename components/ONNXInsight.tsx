"use client";
import { AppData } from "@/lib/types";

type Props = {
  data: AppData;
};

export default function ONNXInsight({ data }: Props) {
  const pred = data.uhiEngine?.onnxPrediction;
  if (!pred) return null;

  const { historicalUHIBaseline, aboveBaseline, anomaly } = pred;
  const currentUHI = data.uhiEngine?.uhiIntensity ?? 0;

  const anomalyAbs = Math.abs(anomaly);
  const direction = aboveBaseline ? "above" : "below";
  const directionColor = aboveBaseline ? "text-red-600" : "text-green-600";
  const directionBg = aboveBaseline ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";

  // Bar widths for visual comparison (max bar = 10°C)
  const maxBar = Math.max(currentUHI, historicalUHIBaseline, 1) * 1.3;
  const currentWidth = Math.min(100, (currentUHI / maxBar) * 100);
  const baselineWidth = Math.min(100, (historicalUHIBaseline / maxBar) * 100);

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-black">🤖 Climatology Model — 20-Year UHI Baseline</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            ONNX Neural Network trained on 20 years of MODIS data. Compares today to historical norms.
          </p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
          ONNX · {new Date().toLocaleString("en-IN", { month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Anomaly Banner */}
      <div className={`rounded-xl border px-4 py-3 mb-5 ${directionBg}`}>
        <p className="text-sm font-semibold text-gray-800">
          Today's UHI is{" "}
          <span className={`font-bold ${directionColor}`}>
            {anomalyAbs.toFixed(2)}°C {direction}
          </span>{" "}
          the 20-year historical average for this location and month.
        </p>
      </div>

      {/* Comparison bars */}
      <div className="flex flex-col gap-4">
        {/* Current UHI */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Current UHI Intensity (Real-time)
            </span>
            <span className="text-sm font-bold text-gray-900">{currentUHI.toFixed(2)}°C</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700"
              style={{ width: `${currentWidth}%` }}
            />
          </div>
        </div>

        {/* 20-year baseline */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              20-Year Climatological Baseline (ONNX Model)
            </span>
            <span className="text-sm font-bold text-gray-900">{historicalUHIBaseline.toFixed(2)}°C</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-700"
              style={{ width: `${baselineWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-gray-500">Current (real-time sensors)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-xs text-gray-500">Baseline (ONNX · 20-yr mean)</span>
        </div>
      </div>
    </div>
  );
}

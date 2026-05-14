"use client";
import { AppData } from "@/lib/types";

type RuralPoint = {
  direction: string;
  temp: number;
  lat: number;
  lng: number;
};

type Props = {
  urbanTemp: number;
  ruralBaseline: number;
  ruralTemps: RuralPoint[];
  uhiIntensity: number;
  adjustedUHI: number;
  nasaLST: number;
  nasaNDVI: number;
  city: string;
};

export default function UHIDeltaPanel({
  urbanTemp,
  ruralBaseline,
  ruralTemps,
  uhiIntensity,
  adjustedUHI,
  nasaLST,
  nasaNDVI,
  city,
}: Props) {
  const intensityColor =
    uhiIntensity >= 5
      ? "#ef4444"
      : uhiIntensity >= 3
        ? "#f97316"
        : uhiIntensity >= 1
          ? "#eab308"
          : "#22c55e";

  const directionMap: Record<string, string> = {
    North: "↑",
    South: "↓",
    East: "→",
    West: "←",
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-black">🌡️ Real UHI Delta</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Urban vs rural temperature comparison — 4 measurement points 25km from
          city center
        </p>
      </div>

      {/* Main comparison */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Rural baseline */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
            Rural Baseline
          </p>
          <p className="text-3xl font-bold text-green-600">
            {ruralBaseline.toFixed(1)}°C
          </p>
          <p className="text-xs text-green-500 mt-1">
            4-point avg · 25km radius
          </p>
        </div>

        {/* UHI intensity arrow */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="text-4xl font-black"
            style={{ color: intensityColor }}
          >
            +{uhiIntensity.toFixed(1)}°C
          </div>
          <div className="text-xs text-gray-400 mt-1">UHI INTENSITY</div>
          <div className="w-full h-px bg-gray-200 mt-2 relative">
            <div
              className="absolute right-0 top-0 w-0 h-0"
              style={{
                borderLeft: "8px solid " + intensityColor,
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
                transform: "translateY(-4px)",
              }}
            />
          </div>
        </div>

        {/* Urban center */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
            {city} Center
          </p>
          <p className="text-3xl font-bold text-red-600">
            {urbanTemp.toFixed(1)}°C
          </p>
          <p className="text-xs text-red-500 mt-1">live · OpenWeatherMap</p>
        </div>
      </div>

      {/* Rural measurement points */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Rural Measurement Points
        </p>
        <div className="grid grid-cols-4 gap-2">
          {ruralTemps.map((point) => (
            <div
              key={point.direction}
              className="bg-gray-50 rounded-lg p-3 text-center"
            >
              <p className="text-lg mb-0.5">{directionMap[point.direction]}</p>
              <p className="text-xs text-gray-500">{point.direction}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {point.temp.toFixed(1)}°C
              </p>
              <p className="text-xs text-gray-400">
                Δ {(urbanTemp - point.temp).toFixed(1)}°C
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* NASA data row */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400 mb-1">NASA POWER · LST</p>
          <p className="text-lg font-bold text-gray-800">
            {nasaLST.toFixed(1)}°C
          </p>
          <p className="text-xs text-gray-400">Land surface temp</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">NDVI Proxy</p>
          <p className="text-lg font-bold text-gray-800">
            {nasaNDVI.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            {nasaNDVI < 0.3
              ? "Low vegetation ⚠️"
              : nasaNDVI < 0.6
                ? "Moderate"
                : "Good cover ✓"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Adjusted UHI</p>
          <p className="text-lg font-bold text-gray-800">
            +{adjustedUHI.toFixed(2)}°C
          </p>
          <p className="text-xs text-gray-400">NDVI-corrected</p>
        </div>
      </div>
    </div>
  );
}

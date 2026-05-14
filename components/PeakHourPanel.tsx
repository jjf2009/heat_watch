"use client";

type HourlyPoint = {
  time: string;
  temp: number;
  uhiDelta: number;
};

type Props = {
  hourlyPattern: HourlyPoint[];
  peakHour: HourlyPoint;
  ruralBaseline: number;
};

export default function PeakHourPanel({
  hourlyPattern,
  peakHour,
  ruralBaseline,
}: Props) {
  const maxDelta = Math.max(...hourlyPattern.map((h) => h.uhiDelta));
  const minDelta = Math.min(...hourlyPattern.map((h) => h.uhiDelta));
  const range = maxDelta - minDelta || 1;

  // Calculate danger duration (hours where delta > peak - 0.5)
  const dangerPoints = hourlyPattern.filter(h => h.uhiDelta >= peakHour.uhiDelta - 0.5);
  const dangerWindow = `${dangerPoints[0].time} – ${dangerPoints[dangerPoints.length - 1].time}`;

  const getBarColor = (delta: number) => {
    if (delta > 4) return "from-red-600 to-red-400";
    if (delta > 2.5) return "from-orange-500 to-orange-300";
    if (delta > 1.5) return "from-amber-400 to-amber-200";
    return "from-green-400 to-green-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⏱️</span>
            <h3 className="font-bold text-lg text-gray-900">Diurnal UHI Cycle</h3>
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            City temperature intensity relative to rural baseline throughout the 24h cycle.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl animate-pulse">
            🔥
          </div>
          <div>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-none mb-1">
              Peak Thermal Stress
            </p>
            <p className="text-2xl font-black text-red-600 leading-none">
              {peakHour.time}
            </p>
            <p className="text-xs font-bold text-red-400 mt-1">
              +{peakHour.uhiDelta.toFixed(1)}°C Intensity
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="relative pt-6 pb-2 px-2">
        {/* Y-Axis guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
          <div className="border-t border-black w-full" />
          <div className="border-t border-black w-full" />
          <div className="border-t border-black w-full" />
        </div>

        <div className="flex items-end gap-1.5 h-32 relative">
          {hourlyPattern.map((h, i) => {
            const heightPct = ((h.uhiDelta - minDelta) / range) * 100;
            const isPeak = h.time === peakHour.time;
            const barGradient = getBarColor(h.uhiDelta);
            
            return (
              <div key={i} className="flex-1 group relative flex flex-col items-center">
                {/* Value on hover */}
                <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  +{h.uhiDelta.toFixed(1)}°C
                </div>
                
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t transition-all duration-500 ${barGradient} ${
                    isPeak ? "ring-2 ring-red-400 ring-offset-2" : "opacity-70 group-hover:opacity-100"
                  }`}
                  style={{
                    height: `${Math.max(8, heightPct)}%`,
                  }}
                />
                
                {/* Time label */}
                <div className="mt-3 text-center">
                  <p className={`text-[10px] font-medium ${isPeak ? "text-red-600 font-bold" : "text-gray-400"}`}>
                    {h.time.replace(":00", "")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Advisory */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Exposure Advisory</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Thermal stress is concentrated between <span className="font-bold">{dangerWindow}</span>. 
            Outdoor labor and transit should be minimized during this {dangerPoints.length}-hour window.
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Baseline Context</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Rural cooling baseline is <span className="font-bold">{ruralBaseline.toFixed(1)}°C</span>. 
            Urban retention factor is high, preventing nighttime heat dissipation.
          </p>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-black">⏱️ Peak UHI Hours</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            When is the city hottest relative to rural areas today?
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
          <p className="text-xs text-red-500 font-medium">PEAK AT</p>
          <p className="text-xl font-bold text-red-600">{peakHour.time}</p>
          <p className="text-xs text-red-400">
            +{peakHour.uhiDelta.toFixed(1)}°C
          </p>
        </div>
      </div>

      {/* Hourly bars */}
      <div className="flex items-end gap-1.5 h-20 mb-2">
        {hourlyPattern.map((h, i) => {
          const heightPct = ((h.uhiDelta - minDelta) / range) * 100;
          const isPeak = h.time === peakHour.time;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(10, heightPct)}%`,
                  background: isPeak
                    ? "#ef4444"
                    : h.uhiDelta > 3
                      ? "#f97316"
                      : "#fbbf24",
                  opacity: isPeak ? 1 : 0.65,
                }}
                title={`${h.time}: +${h.uhiDelta.toFixed(1)}°C`}
              />
            </div>
          );
        })}
      </div>

      {/* Time labels */}
      <div className="flex gap-1.5">
        {hourlyPattern.map((h, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-xs text-gray-400">{h.time.replace(":00", "")}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-amber-50 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>Advisory:</strong> UHI peaks at {peakHour.time} reaching +
          {peakHour.uhiDelta.toFixed(1)}°C above rural baseline of{" "}
          {ruralBaseline.toFixed(1)}°C. Avoid outdoor activity between{" "}
          {peakHour.time} and the following 2 hours.
        </p>
      </div>
    </div>
  );
}

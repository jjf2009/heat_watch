"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type HistPoint = { date: string; temp: number };
type ForecastPoint = { date: string; temp: number; uhiDelta: number };

type Props = {
  historical: HistPoint[];
  forecast: ForecastPoint[];
  regression: { slope: number; r2: number; trend: string };
  ruralBaseline: number;
};

export default function RegressionForecast({ historical, forecast, regression, ruralBaseline }: Props) {
  const histLabels = historical.slice(-14).map(h => {
    const d = new Date(h.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const forecastLabels = forecast.map(f => {
    const d = new Date(f.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const allLabels = [...histLabels, ...forecastLabels];
  const histTemps = historical.slice(-14).map(h => h.temp);
  const forecastTemps = forecast.map(f => f.temp);

  const ruralLine = allLabels.map(() => ruralBaseline);

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: "Historical temp",
        data: [...histTemps, ...Array(forecastTemps.length).fill(null)],
        borderColor: "#f97316",
        backgroundColor: "rgba(249,115,22,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: "Regression forecast",
        data: [...Array(histTemps.length - 1).fill(null), histTemps[histTemps.length - 1], ...forecastTemps],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.05)",
        borderDash: [6, 3],
        fill: false,
        tension: 0.4,
        pointRadius: (ctx: any) => ctx.dataIndex >= histTemps.length ? 4 : 0,
        pointBackgroundColor: "#ef4444",
        borderWidth: 2,
      },
      {
        label: "Rural baseline",
        data: ruralLine,
        borderColor: "#22c55e",
        backgroundColor: "transparent",
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const, labels: { font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw?.toFixed(1)}°C`,
        },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Temperature (°C)", font: { size: 11 } },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 10, font: { size: 10 } },
      },
    },
  };

  const trendLabel = regression.trend === "warming" ? "🔺 Warming" :
                     regression.trend === "cooling" ? "🔻 Cooling" : "➡️ Stable";
  const trendColor = regression.trend === "warming" ? "text-red-600" :
                     regression.trend === "cooling" ? "text-blue-600" : "text-gray-600";

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">📈 Regression Forecast</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Linear regression on 30-day data — projects 7-day city temperature vs rural baseline
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">TREND</p>
            <p className={`text-sm font-semibold ${trendColor}`}>{trendLabel}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">R²</p>
            <p className="text-sm font-semibold text-gray-700">{regression.r2.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">SLOPE</p>
            <p className="text-sm font-semibold text-gray-700">
              {regression.slope > 0 ? "+" : ""}{regression.slope.toFixed(3)}°/day
            </p>
          </div>
        </div>
      </div>

      <Line data={chartData} options={options} />

      <div className="mt-3 p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500">
          <strong>Model:</strong> Ordinary Least Squares regression (inspired by isatyamks/UHI-Detector).
          Dashed red = 7-day projected urban temp. Green = rural baseline ({ruralBaseline.toFixed(1)}°C).
          The gap between them is the predicted UHI intensity.
        </p>
      </div>
    </div>
  );
}
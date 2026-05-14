"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

// Define AppData type to accept any for now
type AppData = any;

function HistoricalChart({ data }: { data: AppData }) {
  const historical = data.historical || [];
  
  // Format labels as DD/MM
  const labels = historical.map((d: any) => {
    const date = new Date(d.date);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  const temperatures = historical.map((d: any) => d.temp);

  // Calculate 7-day rolling average
  const rollingAvg = temperatures.map((val: number, index: number, arr: number[]) => {
    const start = Math.max(0, index - 6);
    const slice = arr.slice(start, index + 1);
    return slice.reduce((sum, curr) => sum + curr, 0) / slice.length;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Avg Temp",
        data: temperatures,
        fill: true,
        backgroundColor: "rgba(249, 115, 22, 0.08)",
        borderColor: "#f97316",
        tension: 0.4,
      },
      {
        label: "7-Day Trend",
        data: rollingAvg,
        fill: false,
        borderColor: "#ef4444",
        borderDash: [6, 3],
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📈 30-Day Temperature History</h2>
      <Line data={chartData} options={options} />
    </div>
  );
}

function ForecastChart({ data }: { data: AppData }) {
  const forecast = data.forecast || [];

  const labels = forecast.map((d: any) => {
    const date = new Date(d.date);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    return `${weekday} ${day}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Max Temp",
        data: forecast.map((d: any) => d.maxTemp),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderRadius: 6,
      },
      {
        label: "Min Temp",
        data: forecast.map((d: any) => d.minTemp),
        backgroundColor: "rgba(251, 191, 36, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🌤️ 5-Day Forecast</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}

function RiskRadarChart({ data }: { data: AppData }) {
  const factors = data?.mlScore?.factors || { thermalFactor: 0, humidityFactor: 0, urbanFactor: 0 };

  const chartData = {
    labels: ['Thermal Anomaly', 'Humidity Stress', 'Urban Density'],
    datasets: [
      {
        label: 'City Risk Profile',
        data: [factors.thermalFactor, factors.humidityFactor, factors.urbanFactor],
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: '#f97316',
      },
      {
        label: 'Safe Threshold',
        data: [35, 35, 35],
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: '#22c55e',
        borderDash: [5, 5],
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🎯 ML Risk Factor Analysis</h2>
      <Radar data={chartData} options={options} />
    </div>
  );
}

function HeatTrendSummary({ data }: { data: AppData }) {
  const historical = data?.historical || [];
  const forecast = data?.forecast || [];
  
  const temps = historical.map((d: any) => d.temp);
  const avgTemp = temps.length ? temps.reduce((sum: number, t: number) => sum + t, 0) / temps.length : 0;
  const maxTemp = temps.length ? Math.max(...temps) : 0;
  const minTemp = temps.length ? Math.min(...temps) : 0;
  
  const lastTemp = temps[temps.length - 1] || 0;
  const temp7DaysAgo = temps[temps.length - 8] || 0;
  const trend = lastTemp - temp7DaysAgo;
  
  const maxForecast = forecast.length ? Math.max(...forecast.map((d: any) => d.maxTemp)) : 0;
  const uhiIntensity = data?.mlScore?.uhi_intensity || 0;

  const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: string }) => (
    <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{icon} {title}</span>
      <span className="text-xl font-bold text-gray-800">{value}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Heat Summary</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="30-Day Avg" value={`${avgTemp.toFixed(1)}°C`} icon="📊" />
        <StatCard title="Period High" value={`${maxTemp.toFixed(1)}°C`} icon="🔥" />
        <StatCard title="Period Low" value={`${minTemp.toFixed(1)}°C`} icon="❄️" />
        <StatCard title="7-Day Trend" value={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}°C`} icon="📈" />
        <StatCard title="Peak Forecast" value={`${maxForecast.toFixed(1)}°C`} icon="🔮" />
        <StatCard title="UHI Intensity" value={`+${uhiIntensity.toFixed(1)}°C`} icon="🏙️" />
      </div>
    </div>
  );
}

export default function Charts({ data }: { data: AppData }) {
  return (
    <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HistoricalChart data={data} />
      <ForecastChart data={data} />
      <RiskRadarChart data={data} />
      <HeatTrendSummary data={data} />
    </div>
  );
}

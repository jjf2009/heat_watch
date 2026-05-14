"use client";
import dynamic from "next/dynamic";
import axios from "axios";
import LocationSearch from "@/components/LocationSearch";
import Charts from "@/components/Charts";
import ExportPDF from "@/components/ExportPDF";
import { AppData, LocationData } from "@/lib/types";
import { useState } from "react";
// HeatMap uses Leaflet which needs dynamic import (no SSR)
const HeatMap = dynamic(() => import("@/components/HeatMap"), { ssr: false });

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelected = (loc: LocationData) => {
    setSelectedLocation(loc);
    setError("");
  };

  const runAnalysis = async () => {
    if (!selectedLocation) {
      setError("Please select a location first.");
      return;
    }

    const loc = selectedLocation;
    setLoading(true);
    setError("");

    try {
      const [weatherRes, historicalRes] = await Promise.all([
        axios.get(`/api/weather?lat=${loc.lat}&lng=${loc.lng}`),
        axios.get(`/api/historical?lat=${loc.lat}&lng=${loc.lng}`),
      ]);

      const { weather, forecast } = weatherRes.data;
      const { historical } = historicalRes.data;

      const mlRes = await axios.post("/api/ml-score", {
        temp: weather.temp,
        humidity: weather.humidity,
        lat: loc.lat,
        lng: loc.lng,
        historical,
      });

      // Generate heat zones
      const heatZones = generateHeatZones(
        loc.lat,
        loc.lng,
        mlRes.data.riskScore,
      );

      setData({
        location: loc,
        weather,
        historical,
        forecast,
        mlScore: mlRes.data,
        heatZones,
        fetchedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);

      setError("Failed to fetch climate data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">🌡️ HeatWatch</h1>
        <p className="text-orange-100 text-lg">
          Urban Heat Island Prediction & Analysis Platform
        </p>
        <p className="text-orange-200 text-sm mt-1">
          For City Planners & Climate Authorities
        </p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <LocationSearch
            onLocationSelected={handleLocationSelected}
            onAnalyze={runAnalysis}
            hasSelectedLocation={Boolean(selectedLocation)}
            selectedLocationLabel={
              selectedLocation
                ? `${selectedLocation.city}, ${selectedLocation.country}`
                : ""
            }
            loading={loading}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-16">
          <div className="inline-block w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Analyzing heat patterns...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-red-500 mt-8">{error}</p>}

      {/* Results */}
      {data && !loading && (
        <div
          id="report-content"
          className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8"
        >
          {/* Risk Score Banner */}
          <RiskBanner data={data} />

          {/* Map + Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeatMap data={data} />
            <WeatherCard data={data} />
          </div>

          {/* Charts */}
          <Charts data={data} />

          {/* Recommendations */}
          <Recommendations data={data} />

          {/* Export */}
          <ExportPDF data={data} />
        </div>
      )}
    </main>
  );
}

// Risk Banner Component
function RiskBanner({ data }: { data: AppData }) {
  const colors = {
    High: "bg-red-50 border-red-300 text-red-800",
    Medium: "bg-yellow-50 border-yellow-300 text-yellow-800",
    Low: "bg-green-50 border-green-300 text-green-800",
  };
  const icons = { High: "🔴", Medium: "🟡", Low: "🟢" };

  return (
    <div
      className={`border-2 rounded-2xl p-6 ${colors[data.mlScore.riskLevel]}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide mb-1 text-black">
            Urban Heat Island Risk
          </p>
          <h2 className="text-3xl font-bold">
            {icons[data.mlScore.riskLevel]} {data.location.city},{" "}
            {data.location.country}
          </h2>
          <p className="mt-1 text-sm text-black">
            Estimated {data.mlScore.uhi_intensity}°C warmer than surrounding
            rural areas
          </p>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black">{data.mlScore.riskScore}</div>
          <div className="text-sm font-semibold uppercase font-black">
            {data.mlScore.riskLevel} Risk
          </div>
        </div>
      </div>
    </div>
  );
}

// Weather Card
function WeatherCard({ data }: { data: AppData }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-lg mb-4 text-black">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Temperature", value: `${data.weather.temp}°C` },
          { label: "Feels Like", value: `${data.weather.feelsLike}°C` },
          { label: "Humidity", value: `${data.weather.humidity}%` },
          { label: "Wind Speed", value: `${data.weather.windSpeed} m/s` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-orange-50 rounded-xl">
        <p className="text-xs text-gray-500">Risk Factors Breakdown</p>
        <div className="mt-2 flex flex-col gap-2">
          {Object.entries(data.mlScore.factors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs w-32 capitalize text-black">
                {key.replace("Factor", "")}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-xs font-medium text-black">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Recommendations
function Recommendations({ data }: { data: AppData }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-lg mb-4 text-black">
        🌱 Recommended Actions for City Planners
      </h3>
      <ul className="flex flex-col gap-3">
        {data.mlScore.recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-orange-500 font-bold mt-0.5">→</span>
            <span className="text-black text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Heat zone generator — creates points around city center scaled by risk
function generateHeatZones(lat: number, lng: number, riskScore: number) {
  const zones = [];
  const count = 40;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.08;
    zones.push({
      lat: lat + radius * Math.sin(angle),
      lng: lng + radius * Math.cos(angle),
      intensity: (riskScore / 100) * (0.5 + Math.random() * 0.5),
    });
  }
  zones.push({ lat, lng, intensity: riskScore / 100 }); // center point always hottest
  return zones;
}

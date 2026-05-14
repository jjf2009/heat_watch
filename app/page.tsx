"use client";
import dynamic from "next/dynamic";
import axios from "axios";
import { motion, Variants } from "framer-motion";
import LocationSearch from "@/components/LocationSearch";
import Charts from "@/components/Charts";
import ExportPDF from "@/components/ExportPDF";
import { AppData, LocationData } from "@/lib/types";
import { useState } from "react";

// HeatMap uses Leaflet which needs dynamic import (no SSR)
const HeatMap = dynamic(() => import("@/components/HeatMap"), { ssr: false });

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
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
      const heatZones = generateHeatZones(loc.lat, loc.lng, mlRes.data.riskScore);

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
    <main className="min-h-screen bg-[#1A1A2E] text-white relative overflow-hidden">
      {/* Terracotta Organic Background blob */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none" />
      
      {/* Header */}
      <div className="py-20 px-4 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-black mb-5 tracking-tight"
        >
          <span className="text-white">Heat</span><span className="text-[#F97316]">Watch</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-200 text-2xl font-light max-w-xl mx-auto"
        >
          Urban Heat Island Prediction &amp; Analysis Platform
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#F97316]/80 text-base mt-2 font-medium tracking-wide uppercase"
        >
          For City Planners &amp; Climate Authorities
        </motion.p>
      </div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto px-4 relative z-10 mb-12"
      >
        <div className="bg-[#1A1A2E]/60 backdrop-blur-md border border-[#F97316]/30 rounded-3xl shadow-2xl p-6">
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
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-16 relative z-10">
          <div className="inline-block w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#F97316] font-medium tracking-wide animate-pulse">Analyzing urban topography...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-red-500 mt-8 relative z-10 font-bold">{error}</p>}

      {/* Results */}
      {data && !loading && (
        <motion.div
          id="report-content"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 relative z-10"
        >
          {/* Risk Score Banner */}
          <motion.div variants={cardVariants}>
            <RiskBanner data={data} />
          </motion.div>

          {/* Map + Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={cardVariants}>
              <div className="bg-[#1A1A2E]/80 backdrop-blur-xl border border-gray-700 rounded-3xl overflow-hidden shadow-2xl h-full p-2">
                <div className="rounded-2xl overflow-hidden h-full min-h-[400px]">
                  <HeatMap data={data} />
                </div>
              </div>
            </motion.div>
            <motion.div variants={cardVariants}>
              <WeatherCard data={data} />
            </motion.div>
          </div>

          {/* Charts */}
          <motion.div variants={cardVariants} id="charts-section" className="bg-white rounded-3xl overflow-hidden p-6 shadow-[0_0_30px_rgba(249,115,22,0.2)] border border-[#F97316]/50">
            {/* White background here is critical to preserve the charts functionality and PDF screenshot color parsing as requested earlier */}
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "#1A1A2E" }}>UHI Forecast & Charts</h2>
            <Charts data={data} />
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={cardVariants}>
            <Recommendations data={data} />
          </motion.div>

          {/* Export */}
          <motion.div variants={cardVariants} className="flex justify-center mt-8">
            <ExportPDF data={data} />
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

function RiskBanner({ data }: { data: AppData }) {
  const colors = {
    High: "bg-red-900/40 border-red-500/50 text-red-200",
    Medium: "bg-yellow-900/40 border-yellow-500/50 text-yellow-200",
    Low: "bg-green-900/40 border-green-500/50 text-green-200",
  };
  const icons = { High: "🔴", Medium: "🟡", Low: "🟢" };

  return (
    <div className={`border rounded-3xl p-8 backdrop-blur-sm shadow-xl ${colors[data.mlScore.riskLevel]}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-80">
            Urban Heat Island Risk
          </p>
          <h2 className="text-4xl font-black mb-2">
            {icons[data.mlScore.riskLevel]} {data.location.city}, {data.location.country}
          </h2>
          <p className="text-sm opacity-90 font-light">
            Estimated <span className="font-bold text-white">{data.mlScore.uhi_intensity}°C</span> warmer than surrounding rural areas
          </p>
        </div>
        <div className="text-center">
          <div className="text-7xl font-black tracking-tighter">{data.mlScore.riskScore}</div>
          <div className="text-sm font-bold uppercase tracking-widest mt-1">
            {data.mlScore.riskLevel} Risk
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherCard({ data }: { data: AppData }) {
  return (
    <div className="bg-[#14142A] border border-gray-600 hover:border-[#F97316]/60 transition-colors rounded-3xl shadow-2xl p-8 h-full flex flex-col">
      <h3 className="font-bold text-2xl mb-6 text-white tracking-tight">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {[
          { label: "Temperature", value: `${data.weather.temp}°C` },
          { label: "Feels Like", value: `${data.weather.feelsLike}°C` },
          { label: "Humidity", value: `${data.weather.humidity}%` },
          { label: "Wind Speed", value: `${data.weather.windSpeed} m/s` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-black/50 border border-gray-700 rounded-2xl p-4 flex flex-col justify-center">
            <p className="text-xs text-gray-300 font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-bold text-[#F97316]">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-5 bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl">
        <p className="text-xs text-orange-200 font-medium uppercase tracking-wider mb-4">Risk Factors Breakdown</p>
        <div className="flex flex-col gap-3">
          {Object.entries(data.mlScore.factors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm w-32 capitalize text-gray-200 font-medium">
                {key.replace("Factor", "")}
              </span>
              <div className="flex-1 bg-black/50 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-[#EA580C] to-[#F97316] h-full rounded-full"
                />
              </div>
              <span className="text-xs font-bold text-white w-8 text-right">{val}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Recommendations({ data }: { data: AppData }) {
  return (
    <div className="bg-[#14142A] border border-gray-600 rounded-3xl shadow-2xl p-8">
      <h3 className="font-bold text-2xl mb-6 text-white tracking-tight flex items-center gap-3">
        <span className="text-[#F97316]">🌱</span> Actionable Intelligence
      </h3>
      <ul className="grid md:grid-cols-2 gap-4">
        {data.mlScore.recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3 bg-black/30 p-4 rounded-2xl border border-gray-800">
            <div className="bg-[#F97316]/20 p-2 rounded-full mt-0.5">
              <span className="text-[#F97316] font-black text-sm leading-none block">→</span>
            </div>
            <span className="text-gray-100 font-medium leading-relaxed text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  zones.push({ lat, lng, intensity: riskScore / 100 }); 
  return zones;
}

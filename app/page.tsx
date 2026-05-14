"use client";
import dynamic from "next/dynamic";
import axios from "axios";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import LocationSearch from "@/components/LocationSearch";
import Charts from "@/components/Charts";
import ExportPDF from "@/components/ExportPDF";
import ReportHeatButton from "@/components/community/ReportHeatButton";
import { AppData, LocationData } from "@/lib/types";

const HeatMap = dynamic(() => import("@/components/HeatMap"), { ssr: false });

/* ── Particle background (same pattern as About/Login) ── */
function inSphere(count: number, radius: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * radius;
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

function ParticleBackground() {
  const ref = useRef<any>(null);
  const sphere = useMemo(() => inSphere(1500, 1.5), []);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 18;
    }
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#F97316" size={0.005} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

/* ── Framer Motion card variant ── */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 160]);

  const handleLocationSelected = (loc: LocationData) => {
    setSelectedLocation(loc);
    setError("");
  };

  const runAnalysis = async () => {
    if (!selectedLocation) { setError("Please select a location first."); return; }
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
        temp: weather.temp, humidity: weather.humidity,
        lat: loc.lat, lng: loc.lng, historical,
      });
      const heatZones = generateHeatZones(loc.lat, loc.lng, mlRes.data.riskScore);
      setData({ location: loc, weather, historical, forecast, mlScore: mlRes.data, heatZones, fetchedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch climate data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A2E] text-white relative overflow-hidden">

      {/* ── 3D Particle Background ── */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* ── Animated Blob Accents ── */}
      <motion.div style={{ y: y1 }} className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[140px] opacity-20 z-0 pointer-events-none" />
      <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[120px] opacity-15 z-0 pointer-events-none" />
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.04, 0.10, 0.04] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[200px] z-0 pointer-events-none"
      />

      {/* ── Header ── */}
      <div className="py-20 px-4 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-7xl font-black mb-5 tracking-tight"
        >
          <span className="text-white drop-shadow-[0_0_30px_rgba(249,115,22,0.25)]">Heat</span>
          <span className="text-[#F97316] drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">Watch</span>
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

      {/* ── Search Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto px-4 relative z-10 mb-12"
      >
        <div className="nm-card p-6">
          <LocationSearch
            onLocationSelected={handleLocationSelected}
            onAnalyze={runAnalysis}
            hasSelectedLocation={Boolean(selectedLocation)}
            selectedLocationLabel={selectedLocation ? `${selectedLocation.city}, ${selectedLocation.country}` : ""}
            loading={loading}
          />
        </div>
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="text-center mt-16 relative z-10">
          <div className="inline-block w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[#F97316] font-medium tracking-wide animate-pulse">Analyzing urban topography…</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && <p className="text-center text-red-400 mt-8 relative z-10 font-bold">{error}</p>}

      {/* ── Results ── */}
      {data && !loading && (
        <motion.div
          id="report-content"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 relative z-10"
        >
          {/* Risk Banner */}
          <motion.div variants={cardVariants}>
            <RiskBanner data={data} />
          </motion.div>

          {/* Map + Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={cardVariants}>
              <div className="nm-card overflow-hidden h-full p-2">
                <div className="rounded-2xl overflow-hidden h-full min-h-[400px]">
                  <HeatMap data={data} />
                </div>
              </div>
            </motion.div>
            <motion.div variants={cardVariants}>
              <WeatherCard data={data} />
            </motion.div>
          </div>

          {/* Community Reporting CTA */}
          <motion.div variants={cardVariants}>
            <ReportHeatButton lat={data.location.lat} lng={data.location.lng} />
          </motion.div>

          {/* Charts — keep white bg for PDF export */}
          <motion.div
            variants={cardVariants}
            id="charts-section"
            className="bg-white rounded-3xl overflow-hidden p-6 shadow-[0_0_30px_rgba(249,115,22,0.2)] border border-[#F97316]/50"
          >
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "#1A1A2E" }}>
              UHI Forecast &amp; Charts
            </h2>
            <Charts data={data} />
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={cardVariants}>
            <Recommendations data={data} />
          </motion.div>

          {/* Export */}
          <motion.div variants={cardVariants} className="flex justify-center mt-4">
            <div className="w-full">
              <ExportPDF data={data} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
function RiskBanner({ data }: { data: AppData }) {
  const colors = {
    High:   "bg-red-900/30 border-red-500/40 text-red-200",
    Medium: "bg-yellow-900/30 border-yellow-500/40 text-yellow-200",
    Low:    "bg-green-900/30 border-green-500/40 text-green-200",
  };
  const icons = { High: "🔴", Medium: "🟡", Low: "🟢" };

  return (
    <div className={`nm-card border p-8 ${colors[data.mlScore.riskLevel]}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-80">
            Urban Heat Island Risk
          </p>
          <h2 className="text-4xl font-black mb-2">
            {icons[data.mlScore.riskLevel]} {data.location.city}, {data.location.country}
          </h2>
          <p className="text-sm opacity-90 font-light">
            Estimated{" "}
            <span className="font-bold text-white">{data.mlScore.uhi_intensity}°C</span>{" "}
            warmer than surrounding rural areas
          </p>
        </div>
        <div className="text-center nm-inset px-8 py-4">
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
    <div className="nm-card p-8 h-full flex flex-col">
      <h3 className="font-bold text-2xl mb-6 text-white tracking-tight">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {[
          { label: "Temperature", value: `${data.weather.temp}°C` },
          { label: "Feels Like",  value: `${data.weather.feelsLike}°C` },
          { label: "Humidity",    value: `${data.weather.humidity}%` },
          { label: "Wind Speed",  value: `${data.weather.windSpeed} m/s` },
        ].map(({ label, value }) => (
          <div key={label} className="nm-inset p-4 flex flex-col justify-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-bold text-[#F97316]">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 nm-inset-sm p-5">
        <p className="text-xs text-orange-300 font-medium uppercase tracking-wider mb-4">Risk Factors Breakdown</p>
        <div className="flex flex-col gap-3">
          {Object.entries(data.mlScore.factors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm w-32 capitalize text-gray-300 font-medium">
                {key.replace("Factor", "")}
              </span>
              <div className="flex-1 nm-track h-2.5 overflow-hidden">
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
    <div className="nm-card p-8">
      <h3 className="font-bold text-2xl mb-6 text-white tracking-tight flex items-center gap-3">
        <span className="text-[#F97316]">🌱</span> Actionable Intelligence
      </h3>
      <ul className="grid md:grid-cols-2 gap-4">
        {data.mlScore.recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3 nm-inset-sm p-4">
            <div className="nm-btn-orange p-2 rounded-full mt-0.5 flex-shrink-0">
              <span className="text-white font-black text-sm leading-none block">→</span>
            </div>
            <span className="text-gray-200 font-medium leading-relaxed text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function generateHeatZones(lat: number, lng: number, riskScore: number) {
  const zones = [];
  for (let i = 0; i < 40; i++) {
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

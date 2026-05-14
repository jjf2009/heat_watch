"use client";

import dynamic from "next/dynamic";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Brain, Users, Satellite, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Lazy-load the map (Leaflet is browser-only)
const HeatReportMap = dynamic(
  () => import("@/components/community/HeatReportMap"),
  { ssr: false, loading: () => <div className="flex-1 min-h-[500px] nm-inset rounded-2xl animate-pulse" /> }
);

// ── 3D Particle background (same pattern as About / Home) ──
function inSphere(count: number, radius: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.cbrt(Math.random()) * radius;
    arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
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
      ref.current.rotation.x -= delta / 14;
      ref.current.rotation.y -= delta / 20;
    }
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#DC2626" size={0.005} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

// ── Layer legend cards ──────────────────────────────────────
const layers = [
  {
    icon: <Satellite size={20} className="text-blue-400" />,
    title: "Satellite Data",
    desc: "Thermal imaging & surface temperature",
    color: "border-blue-500/30",
  },
  {
    icon: <Brain size={20} className="text-purple-400" />,
    title: "ML Prediction",
    desc: "AI-powered UHI risk forecast (coming soon)",
    color: "border-purple-500/30",
  },
  {
    icon: <Users size={20} className="text-orange-400" />,
    title: "Community Reports",
    desc: "Where people actually feel extreme heat",
    color: "border-orange-500/30",
  },
];

export default function ReportHeatPage() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <main className="min-h-screen bg-[#1A1A2E] text-white relative overflow-x-hidden">
      {/* 3D Particle background */}
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Parallax blobs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] bg-[#DC2626] rounded-full mix-blend-screen filter blur-[140px] opacity-15 z-0 pointer-events-none"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[400px] h-[400px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[120px] opacity-15 z-0 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.09, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#DC2626] rounded-full mix-blend-screen filter blur-[180px] z-0 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 nm-inset-sm px-4 py-2 rounded-full text-sm text-orange-300 font-medium mb-6">
            <MapPin size={14} className="text-orange-400" />
            Community Heat Intelligence Network
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="text-white">Community </span>
            <span className="text-[#F97316] drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              Heat Reporting
            </span>
          </h1>
          <p className="text-gray-300 text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Help identify unbearable heat zones and lack of shade in your city.
          </p>
          <p className="text-gray-500 text-sm mt-3 italic">
            "Where science says it is hot vs where people actually feel extreme heat."
          </p>
        </motion.div>

        {/* Layer explanation cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {layers.map((layer, i) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`nm-card p-5 border ${layer.color} flex items-start gap-4`}
            >
              <div className="nm-inset-sm p-2.5 rounded-xl flex-shrink-0">{layer.icon}</div>
              <div>
                <p className="font-semibold text-white text-sm mb-1">{layer.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{layer.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Map card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="nm-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">📍 Drop a Report Pin</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Click anywhere on the map to report thermal discomfort
              </p>
            </div>
            <div className="flex items-center gap-2 nm-inset-sm px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs text-orange-300 font-medium">Live</span>
            </div>
          </div>

          <HeatReportMap />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 nm-card p-6"
        >
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">
            Report Marker Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "1 — Cool", color: "#22c55e" },
              { label: "2 — Warm", color: "#84cc16" },
              { label: "3 — Hot", color: "#f59e0b" },
              { label: "4 — Very Hot", color: "#ef4444" },
              { label: "5 — Unbearable", color: "#7f1d1d" },
            ].map(({ label, color }) => (
              <div key={label} className="nm-inset-sm px-3 py-2 rounded-xl flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                />
                <span className="text-xs text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Civic message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-600 text-sm mt-8 italic"
        >
          Your report helps improve urban climate intelligence and supports city planners in building cooler, healthier cities.
        </motion.p>
      </div>
    </main>
  );
}

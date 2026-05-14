"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, useScroll, useTransform } from "framer-motion";
import { Points, PointMaterial } from "@react-three/drei";

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
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
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

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <main className="min-h-screen bg-[#1A1A2E] text-white relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-50">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Parallax blobs */}
      <motion.div style={{ y: y1 }} className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-[#F97316] rounded-full mix-blend-screen filter blur-[100px] opacity-30 z-0" />
      <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-[#F97316] rounded-full mix-blend-screen filter blur-[100px] opacity-30 z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-32"
        >
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            The <span className="text-[#F97316]">UHI</span> Crisis
          </h1>
          <p className="text-xl md:text-3xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
            Urban Heat Islands are silently reshaping our cities. We are building the tools to understand, predict, and mitigate extreme urban heat.
          </p>
        </motion.div>

        {/* Mission section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              HeatWatch leverages advanced machine learning, satellite data, and localized climate models to provide actionable insights for urban planners. Our organic, data-driven approach allows cities to breathe again by predicting heat hotspots before they become hazardous.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="nm-card aspect-square p-8 flex items-center justify-center relative overflow-hidden"
          >
            {/* Animated inner glow */}
            <div className="absolute inset-0 bg-[#F97316]/10 animate-pulse rounded-[40%_60%_70%_30%/40%_50%_60%_50%]" />
            <span className="text-5xl font-black text-[#F97316] relative z-10 text-center leading-tight">
              Data &lt; Action
            </span>
          </motion.div>
        </div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { value: "8°C", label: "Max UHI intensity recorded", icon: "🌡️" },
            { value: "500+", label: "Cities analysed globally", icon: "🏙️" },
            { value: "94%", label: "Prediction accuracy", icon: "🎯" },
          ].map(({ value, label, icon }) => (
            <div key={label} className="nm-card p-6 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-4xl font-black text-[#F97316] mb-2">{value}</div>
              <div className="text-sm text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}

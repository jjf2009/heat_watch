"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Points, PointMaterial } from "@react-three/drei";
import { useRouter } from "next/navigation";

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
  const sphere = useMemo(() => inSphere(1000, 1.2), []);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere as Float32Array} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#F97316" size={0.003} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/pricing");
  };

  return (
    <main className="min-h-screen bg-[#1A1A2E] flex items-center justify-center relative overflow-hidden px-4">
      {/* 3D Particle Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Blob */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-[#F97316] rounded-full mix-blend-screen filter blur-[160px] z-0"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="nm-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_12px_rgba(249,115,22,0.3)]">
              Welcome Back
            </h1>
            <p className="text-gray-400">Log in to access advanced tools</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email / Username
              </label>
              <input
                type="text"
                className="nm-input w-full px-4 py-3 text-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                className="nm-input w-full px-4 py-3 text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="nm-btn-orange w-full text-white font-bold py-3 px-4 rounded-xl"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <hr className="flex-1 border-gray-700/60" />
            <span className="text-gray-500 text-sm">OR</span>
            <hr className="flex-1 border-gray-700/60" />
          </div>

          {/* Google button */}
          <button className="nm-btn-white mt-5 w-full flex items-center justify-center gap-3 text-black font-semibold py-3 px-4 rounded-xl">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login with Google
          </button>
        </div>
      </motion.div>
    </main>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function ReportHeatButton({ lat, lng }: { lat?: number; lng?: number }) {
  const router = useRouter();

  const handleClick = () => {
    if (lat && lng) {
      router.push(`/report-heat?lat=${lat}&lng=${lng}`);
    } else {
      router.push("/report-heat");
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl overflow-hidden font-bold text-white text-base tracking-wide transition-all"
      style={{
        background: "linear-gradient(135deg, #EA580C 0%, #F97316 50%, #DC2626 100%)",
        boxShadow:
          "-4px -4px 12px rgba(45,45,90,0.5), 4px 4px 12px rgba(0,0,10,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
    >
      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <MapPin size={20} className="text-white drop-shadow" />
      </motion.div>

      <span className="relative z-10">📍 Report Heat Spot</span>

      <span className="relative z-10 ml-auto text-[10px] font-normal bg-white/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
        Community
      </span>
    </motion.button>
  );
}

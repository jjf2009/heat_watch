"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

type ToastType = "success" | "error" | "rate-limited";

type Props = {
  type: ToastType;
  message: string;
  onClose: () => void;
};

const config = {
  success: {
    icon: <CheckCircle size={20} className="text-green-400" />,
    border: "border-green-500/30",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.2)]",
  },
  error: {
    icon: <AlertTriangle size={20} className="text-red-400" />,
    border: "border-red-500/30",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
  },
  "rate-limited": {
    icon: <AlertTriangle size={20} className="text-yellow-400" />,
    border: "border-yellow-500/30",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.2)]",
  },
};

export default function ReportSuccessToast({ type, message, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const c = config[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`fixed bottom-6 right-6 z-[200] flex items-start gap-3 p-4 rounded-2xl nm-card border ${c.border} ${c.glow} max-w-sm`}
      >
        <div className="mt-0.5 flex-shrink-0">{c.icon}</div>
        <p className="text-sm text-gray-200 leading-relaxed flex-1">{message}</p>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

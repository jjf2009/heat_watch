"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Thermometer, TreePine, MessageSquare, Send } from "lucide-react";
import type { ShadeLevel } from "@/lib/community/types";

type Props = {
  lat: number;
  lng: number;
  onSubmit: (data: {
    heatLevel: number;
    shadeLevel: ShadeLevel;
    comment?: string;
    deviceTemp?: number;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
};

const shadeOptions: { value: ShadeLevel; label: string; icon: string }[] = [
  { value: "none", label: "No Shade", icon: "☀️" },
  { value: "partial", label: "Partial Shade", icon: "⛅" },
  { value: "good", label: "Good Shade", icon: "🌳" },
];

const heatLabels = ["Cool", "Warm", "Hot", "Very Hot", "Unbearable"];
const heatColors = ["#22c55e", "#84cc16", "#f59e0b", "#ef4444", "#7f1d1d"];

export default function HeatReportModal({ lat, lng, onSubmit, onCancel, loading }: Props) {
  const [heatLevel, setHeatLevel] = useState(3);
  const [shadeLevel, setShadeLevel] = useState<ShadeLevel>("partial");
  const [comment, setComment] = useState("");
  const [deviceTemp, setDeviceTemp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      heatLevel,
      shadeLevel,
      comment: comment.trim() || undefined,
      deviceTemp: deviceTemp ? parseFloat(deviceTemp) : undefined,
    });
  };

  const color = heatColors[heatLevel - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(8px)", background: "rgba(10,10,20,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && onCancel()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="nm-card w-full max-w-md relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">📍 Report Heat Spot</h2>
                <p className="text-xs text-gray-400">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-2 rounded-xl nm-inset-sm text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
            {/* Heat Severity Slider */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <Thermometer size={16} className="text-orange-400" />
                Heat Severity
                <span
                  className="ml-auto text-sm font-black px-3 py-0.5 rounded-full"
                  style={{ color, background: `${color}22` }}
                >
                  {heatLabels[heatLevel - 1]}
                </span>
              </label>
              <div className="nm-inset-sm p-4">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={heatLevel}
                  onChange={(e) => setHeatLevel(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>1 — Cool</span>
                  <span>5 — Unbearable</span>
                </div>
              </div>
              {/* Heat level dots indicator */}
              <div className="flex gap-2 mt-2 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setHeatLevel(n)}
                    className="w-8 h-8 rounded-full text-xs font-bold border-2 transition-all"
                    style={{
                      background: n <= heatLevel ? heatColors[n - 1] : "transparent",
                      borderColor: heatColors[n - 1],
                      color: n <= heatLevel ? "white" : heatColors[n - 1],
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Shade Availability */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <TreePine size={16} className="text-green-400" />
                Shade Availability
              </label>
              <div className="grid grid-cols-3 gap-2">
                {shadeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setShadeLevel(opt.value)}
                    className={`p-3 rounded-xl text-center transition-all text-sm font-medium border ${
                      shadeLevel === opt.value
                        ? "border-orange-500/60 bg-orange-500/10 text-orange-300"
                        : "border-white/5 nm-inset-sm text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="text-[11px] leading-tight">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Device Temp */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">
                Device Temperature{" "}
                <span className="text-gray-500 font-normal">(optional °C)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 38.5"
                value={deviceTemp}
                onChange={(e) => setDeviceTemp(e.target.value)}
                className="nm-input w-full px-4 py-2.5 text-sm"
                min={-20}
                max={80}
                step={0.1}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <MessageSquare size={16} className="text-blue-400" />
                Comment{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Describe what makes this spot hot..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
                className="nm-input w-full px-4 py-2.5 text-sm resize-none"
              />
              <p className="text-[10px] text-gray-600 text-right mt-1">{comment.length}/300</p>
            </div>

            {/* Civic prompt */}
            <p className="text-[11px] text-gray-500 text-center italic">
              Your report helps improve urban climate intelligence.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl nm-inset-sm text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 nm-btn-orange py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {loading ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

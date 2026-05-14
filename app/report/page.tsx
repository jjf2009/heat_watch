"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, ThermometerSun, Trees, Send, CheckCircle2, X, ArrowLeft } from "lucide-react";

// Leaflet must be dynamically imported (no SSR)
const ReportMap = dynamic(() => import("@/components/ReportMap"), { ssr: false });

type Report = {
  id: string;
  lat: number;
  lng: number;
  heatLevel: number;
  shadeLevel: number;
  comment: string;
  timestamp: string;
  city: string;
};

const HEAT_LABELS = ["", "Mild", "Warm", "Hot", "Very Hot", "Extreme"];
const SHADE_LABELS = ["", "Full Shade", "Mostly Shaded", "Partial Shade", "Little Shade", "No Shade"];
const HEAT_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#ef4444", "#7f1d1d"];

function ReportPageContent() {
  const searchParams = useSearchParams();
  const lat = parseFloat(searchParams.get("lat") ?? "20.5937");
  const lng = parseFloat(searchParams.get("lng") ?? "78.9629");
  const city = searchParams.get("city") ?? "India";
  const plan = searchParams.get("plan") ?? "free";

  const [pinnedLat, setPinnedLat] = useState<number | null>(null);
  const [pinnedLng, setPinnedLng] = useState<number | null>(null);
  const [heatLevel, setHeatLevel] = useState(3);
  const [shadeLevel, setShadeLevel] = useState(3);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<Report[]>([]);

  // Load existing reports on mount
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/community-report?lat=${lat}&lng=${lng}&radius=50`);
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports ?? []);
      }
    } catch {
      // Silent fail
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleMapPin = (pinLat: number, pinLng: number) => {
    setPinnedLat(pinLat);
    setPinnedLng(pinLng);
    setSubmitted(false);
    setError("");
  };

  const handleSubmit = async () => {
    if (pinnedLat === null || pinnedLng === null) {
      setError("Please drop a pin on the map first.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: pinnedLat,
          lng: pinnedLng,
          heatLevel,
          shadeLevel,
          comment,
          city,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");

      setSubmitted(true);
      setReports((prev) => [json.report, ...prev]);
      setPinnedLat(null);
      setPinnedLng(null);
      setComment("");
      setHeatLevel(3);
      setShadeLevel(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#c41e3a] to-[#f7931e] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href={`/dashboard?lat=${lat}&lng=${lng}&city=${encodeURIComponent(city)}&plan=${plan}`} className="hover:opacity-75 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <ThermometerSun size={28} /> Report Heat Conditions
            </h1>
            <p className="text-sm opacity-80 mt-1">
              📍 Reporting near <strong>{city}</strong> · Drop a pin on the map where you feel heat discomfort
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Map (2/3 width) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <MapPin size={16} className="text-[var(--accent-fire)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Click anywhere on the map to drop your report pin
              </p>
              {pinnedLat && (
                <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">
                  {pinnedLat.toFixed(5)}, {pinnedLng!.toFixed(5)}
                </span>
              )}
            </div>
            <ReportMap
              centerLat={lat}
              centerLng={lng}
              city={city}
              reports={reports}
              pinnedLat={pinnedLat}
              pinnedLng={pinnedLng}
              onPin={handleMapPin}
            />
          </div>

          {/* Existing reports list */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow">
            <h3 className="font-bold text-sm text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Trees size={16} className="text-green-400" />
              Recent Community Reports ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">
                No reports yet for this area. Be the first to report!
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 bg-[var(--surface-light)] rounded-xl px-3 py-2.5 border border-[var(--border)]"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: HEAT_COLORS[r.heatLevel] }}
                    >
                      {r.heatLevel}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[var(--foreground)]" style={{ color: HEAT_COLORS[r.heatLevel] }}>
                          {HEAT_LABELS[r.heatLevel]} Heat
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">·</span>
                        <span className="text-xs text-[var(--text-muted)]">{SHADE_LABELS[r.shadeLevel]}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-auto">
                          {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{r.comment}</p>
                      )}
                      <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5 opacity-50">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Form (1/3 width) ── */}
        <div className="flex flex-col gap-4">
          {/* Step indicator */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow">
            <h3 className="font-bold text-sm text-[var(--foreground)] mb-4">📋 Submit Your Report</h3>

            {/* Pin status */}
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium border ${
              pinnedLat
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-[var(--surface-light)] border-[var(--border)] text-[var(--text-muted)]"
            }`}>
              <MapPin size={16} />
              {pinnedLat
                ? `Pin dropped · ${pinnedLat.toFixed(4)}, ${pinnedLng!.toFixed(4)}`
                : "Step 1: Click map to drop a pin"}
            </div>

            {/* Heat Level */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 block">
                🌡️ Heat Level
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setHeatLevel(v)}
                    className={`py-2 rounded-lg text-xs font-black transition-all border ${
                      heatLevel === v
                        ? "text-white border-transparent shadow-lg scale-105"
                        : "bg-[var(--surface-light)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent-fire)]"
                    }`}
                    style={heatLevel === v ? { backgroundColor: HEAT_COLORS[v], borderColor: HEAT_COLORS[v] } : {}}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mt-1.5 font-medium" style={{ color: HEAT_COLORS[heatLevel] }}>
                {HEAT_LABELS[heatLevel]}
              </p>
            </div>

            {/* Shade Level */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 block">
                🌳 Shade Availability
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setShadeLevel(v)}
                    className={`py-2 rounded-lg text-xs font-black transition-all border ${
                      shadeLevel === v
                        ? "bg-[var(--accent-cool)] text-white border-transparent shadow-lg scale-105"
                        : "bg-[var(--surface-light)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent-cool)]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mt-1.5 text-[var(--text-muted)] font-medium">
                {SHADE_LABELS[shadeLevel]}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 block">
                💬 Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. No shade, concrete footpath, feels unbearable after noon..."
                rows={3}
                maxLength={300}
                className="w-full bg-[var(--surface-light)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-fire)] resize-none transition"
              />
              <p className="text-right text-xs text-[var(--text-muted)] mt-0.5">{comment.length}/300</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 mb-3">
                <X size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            {/* Success with Return Button */}
            {submitted && (
              <div className="flex flex-col gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                  <p className="text-xs text-green-400 font-medium">Report submitted! Drop another pin to report more, or return below.</p>
                </div>
                <Link
                  href={`/dashboard?lat=${lat}&lng=${lng}&city=${encodeURIComponent(city)}&plan=${plan}`}
                  className="w-full py-3 rounded-xl bg-[var(--surface-light)] border-2 border-[var(--accent-fire)]/30 hover:border-[var(--accent-fire)] text-[var(--foreground)] text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <ArrowLeft size={16} className="text-[var(--accent-fire)]" />
                  ← Back to Dashboard
                </Link>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !pinnedLat}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-danger)] text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>

          {/* Info card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow text-xs text-[var(--text-muted)] leading-relaxed">
            <p className="font-bold text-[var(--foreground)] mb-2">🔬 How your report helps</p>
            <ul className="flex flex-col gap-1.5 list-none">
              <li>✅ Validates satellite LST readings with human perception</li>
              <li>✅ Identifies micro-hotspots missed by 1km MODIS resolution</li>
              <li>✅ Improves ML model calibration over time</li>
              <li>✅ Flags vulnerable areas for city planners</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="w-12 h-12 border-4 border-[var(--accent-fire)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReportPageContent />
    </Suspense>
  );
}

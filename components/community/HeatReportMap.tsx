"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { ReportMarker, ShadeLevel } from "@/lib/community/types";
import HeatReportModal from "./HeatReportModal";
import ReportSuccessToast from "./ReportSuccessToast";
import { encodeGeoHash } from "@/lib/community/geoHash";
import { isRateLimited, recordSubmission, getBrowserFingerprint } from "@/lib/community/rateLimiter";

type PendingPin = { lat: number; lng: number };
type ToastState = { type: "success" | "error" | "rate-limited"; message: string } | null;

export default function HeatReportMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const communityLayerRef = useRef<any>(null);
  const pendingMarkerRef = useRef<any>(null);

  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [reportCount, setReportCount] = useState(0);

  const searchParams = useSearchParams();

  const showToast = useCallback((t: ToastState) => setToast(t), []);

  // ── Initialise Leaflet map ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapInstanceRef.current) return; // already init'd

      const urlLat = searchParams.get("lat");
      const urlLng = searchParams.get("lng");
      
      const centerLat = urlLat ? parseFloat(urlLat) : 20.5937;
      const centerLng = urlLng ? parseFloat(urlLng) : 78.9629;
      const initialZoom = urlLat && urlLng ? 12 : 5;

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      // Community reports layer group
      const layer = L.layerGroup().addTo(map);
      communityLayerRef.current = layer;
      mapInstanceRef.current = map;

      // Load existing markers
      loadExistingReports(L, layer);

      // Click to drop pin
      map.on("click", (e: any) => {
        const wrappedLatLng = e.latlng.wrap();
        const { lat, lng } = wrappedLatLng;

        // Remove old pending marker
        if (pendingMarkerRef.current) {
          map.removeLayer(pendingMarkerRef.current);
          pendingMarkerRef.current = null;
        }

        // Drop animated pin
        const pinIcon = L.divIcon({
          className: "",
          html: `<div style="
            animation: bounceIn 0.4s cubic-bezier(0.36,0.07,0.19,0.97);
            width:32px;height:40px;position:relative;
          ">
            <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
              <ellipse cx="16" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
              <path d="M16 0C8.82 0 3 5.82 3 13c0 9.75 13 27 13 27s13-17.25 13-27C29 5.82 23.18 0 16 0z" fill="#F97316"/>
              <circle cx="16" cy="13" r="6" fill="white" opacity="0.9"/>
              <text x="16" y="17" text-anchor="middle" font-size="8" font-weight="bold" fill="#EA580C">📍</text>
            </svg>
          </div>`,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        });

        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        pendingMarkerRef.current = marker;
        setPendingPin({ lat, lng });
      });
    })();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load existing community reports ────────────────────
  const loadExistingReports = async (L: any, layer: any) => {
    try {
      const res = await fetch("/api/community-report");
      const { markers }: { markers: ReportMarker[] } = await res.json();
      setReportCount(markers.length);
      addMarkersToLayer(L, layer, markers);
    } catch {
      /* silently fail — non-critical */
    }
  };

  const addMarkersToLayer = (L: any, layer: any, markers: ReportMarker[]) => {
    const heatColors = ["#22c55e", "#84cc16", "#f59e0b", "#ef4444", "#7f1d1d"];
    markers.forEach((m) => {
      const color = heatColors[Math.min(m.heatLevel - 1, 4)];
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:${color};border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          display:flex;align-items:center;justify-content:center;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([m.lat, m.lng], { icon })
        .addTo(layer)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:140px;">
            <b style="color:#EA580C">Community Report</b><br/>
            🌡️ Heat: <b>${m.heatLevel}/5</b><br/>
            🌳 Shade: <b>${m.shadeLevel}</b><br/>
            <small style="color:#888">${new Date(m.createdAt).toLocaleString()}</small>
          </div>
        `);
    });
  };

  // ── Submit handler ──────────────────────────────────────
  const handleSubmit = async (formData: {
    heatLevel: number;
    shadeLevel: ShadeLevel;
    comment?: string;
    deviceTemp?: number;
  }) => {
    if (!pendingPin) return;
    const { lat, lng } = pendingPin;

    // Client-side rate limit
    if (isRateLimited(lat, lng)) {
      showToast({ type: "rate-limited", message: "Report already submitted recently for this area." });
      setPendingPin(null);
      if (pendingMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(pendingMarkerRef.current);
        pendingMarkerRef.current = null;
      }
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        lat,
        lng,
        heatLevel: formData.heatLevel,
        shadeLevel: formData.shadeLevel,
        comment: formData.comment,
        deviceTemp: formData.deviceTemp,
        areaHash: encodeGeoHash(lat, lng, 5),
        hashedUser: getBrowserFingerprint(),
      };

      const res = await fetch("/api/community-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        showToast({ type: "rate-limited", message: "Report already submitted recently for this area." });
      } else if (!res.ok) {
        throw new Error("Failed");
      } else {
        recordSubmission(lat, lng);
        showToast({ type: "success", message: "Community heat report submitted successfully. Thank you!" });
        setReportCount((c) => c + 1);

        // Add to community layer immediately
        if (mapInstanceRef.current && communityLayerRef.current) {
          const L = (await import("leaflet")).default;
          const newMarker: ReportMarker = {
            id: "new",
            lat,
            lng,
            heatLevel: formData.heatLevel,
            shadeLevel: formData.shadeLevel,
            createdAt: new Date().toISOString(),
          };
          addMarkersToLayer(L, communityLayerRef.current, [newMarker]);
        }

        // Remove pending pin (replaced by community dot)
        if (pendingMarkerRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(pendingMarkerRef.current);
          pendingMarkerRef.current = null;
        }
      }
    } catch {
      showToast({ type: "error", message: "Failed to submit report. Please try again." });
    } finally {
      setSubmitting(false);
      setPendingPin(null);
    }
  };

  const handleCancel = () => {
    setPendingPin(null);
    if (pendingMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(pendingMarkerRef.current);
      pendingMarkerRef.current = null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes bounceIn {
          0% { transform: translateY(-30px) scale(0.5); opacity:0; }
          60% { transform: translateY(4px) scale(1.1); opacity:1; }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="relative w-full h-full min-h-[500px] flex flex-col">
        {/* Map instruction banner */}
        <div className="nm-inset-sm px-4 py-2 mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-300">
            <span className="text-orange-400 font-semibold">Click anywhere on the map</span> to drop a heat report pin
          </p>
          {reportCount > 0 && (
            <span className="text-xs text-orange-300 nm-card px-3 py-1 rounded-full font-medium">
              {reportCount} report{reportCount !== 1 ? "s" : ""} in this area
            </span>
          )}
        </div>

        {/* Leaflet map */}
        <div ref={mapRef} className="flex-1 rounded-2xl overflow-hidden" style={{ minHeight: "460px" }} />
      </div>

      {/* Report form modal */}
      {pendingPin && (
        <HeatReportModal
          lat={pendingPin.lat}
          lng={pendingPin.lng}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      )}

      {/* Toast */}
      {toast && (
        <ReportSuccessToast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

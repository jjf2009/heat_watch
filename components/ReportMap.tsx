"use client";

import { useEffect, useRef, useCallback } from "react";

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

type Props = {
  centerLat: number;
  centerLng: number;
  city: string;
  reports: Report[];
  pinnedLat: number | null;
  pinnedLng: number | null;
  onPin: (lat: number, lng: number) => void;
};

const HEAT_COLORS = ["", "#22c55e", "#84cc16", "#f59e0b", "#ef4444", "#7f1d1d"];
const HEAT_LABELS = ["", "Mild", "Warm", "Hot", "Very Hot", "Extreme"];
const SHADE_LABELS = ["", "Full Shade", "Mostly Shaded", "Partial Shade", "Little Shade", "No Shade"];

export default function ReportMap({
  centerLat,
  centerLng,
  city,
  reports,
  pinnedLat,
  pinnedLng,
  onPin,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const pinnedMarkerRef = useRef<any>(null);
  const reportMarkersRef = useRef<any[]>([]);
  const LRef = useRef<any>(null);

  // Init map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Destroy old instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    (mapRef.current as any)._leaflet_id = null;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;

      LRef.current = L;

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Dark base tile
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      // Fix for grey tiles when container resizes or initializes hidden
      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      // City center pulse marker
      const centerIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:40px;height:40px;">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:#f7931e;opacity:0.25;
              animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
            "></div>
            <div style="
              position:absolute;inset:8px;border-radius:50%;
              background:#f7931e;border:2px solid #fff;
              display:flex;align-items:center;justify-content:center;
              font-size:12px;
            ">📍</div>
          </div>
          <style>
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([centerLat, centerLng], { icon: centerIcon })
        .addTo(map)
        .bindPopup(`<b>${city}</b><br/>Your searched location`);

      // Click to drop pin
      map.on("click", (e: any) => {
        onPin(e.latlng.lat, e.latlng.lng);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [centerLat, centerLng]);

  // Update pinned marker whenever pinnedLat/pinnedLng changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Remove old pinned marker
    if (pinnedMarkerRef.current) {
      map.removeLayer(pinnedMarkerRef.current);
      pinnedMarkerRef.current = null;
    }

    if (pinnedLat !== null && pinnedLng !== null) {
      const pinIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            background:#ef4444;color:#fff;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            border:3px solid #fff;
            box-shadow:0 2px 12px rgba(0,0,0,0.5);
          ">
            <span style="transform:rotate(45deg);font-size:14px;">📌</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      pinnedMarkerRef.current = L.marker([pinnedLat, pinnedLng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>Your Report Pin</b><br/>${pinnedLat.toFixed(5)}, ${pinnedLng.toFixed(5)}<br/><small>Fill the form and submit →</small>`)
        .openPopup();
    }
  }, [pinnedLat, pinnedLng]);

  // Render community report markers whenever reports change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    if (!map || !L) return;

    // Remove old report markers
    reportMarkersRef.current.forEach((m) => map.removeLayer(m));
    reportMarkersRef.current = [];

    reports.forEach((r) => {
      const color = HEAT_COLORS[r.heatLevel] ?? "#f59e0b";
      const reportIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            background:${color};color:#fff;
            border-radius:50%;
            width:26px;height:26px;
            display:flex;align-items:center;justify-content:center;
            font-size:10px;font-weight:900;
            border:2px solid rgba(255,255,255,0.8);
            box-shadow:0 2px 6px rgba(0,0,0,0.4);
          ">${r.heatLevel}</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const timeAgo = getTimeAgo(r.timestamp);
      const marker = L.marker([r.lat, r.lng], { icon: reportIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px;">
            <b style="color:${color}">${HEAT_LABELS[r.heatLevel]} Heat</b><br/>
            <span style="color:#888;font-size:12px;">${SHADE_LABELS[r.shadeLevel]}</span><br/>
            ${r.comment ? `<p style="margin:4px 0;font-size:12px;">${r.comment}</p>` : ""}
            <span style="color:#aaa;font-size:11px;">📍 ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}</span><br/>
            <span style="color:#aaa;font-size:11px;">🕐 ${timeAgo}</span>
          </div>
        `);

      reportMarkersRef.current.push(marker);
    });
  }, [reports]);

  return (
    <div ref={mapRef} style={{ height: "520px", width: "100%", cursor: "crosshair" }} />
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

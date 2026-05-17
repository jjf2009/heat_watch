"use client";
import React, { useEffect, useRef, useState } from "react";
import { AppData } from "@/lib/types";

type Props = {
  data: AppData;
};

type LayerMode = "heatzones" | "lst" | "ndvi";

export default function HeatMap({ data }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<{ heatzones: any[]; lst: any; ndvi: any }>({
    heatzones: [],
    lst: null,
    ndvi: null,
  });

  const [activeLayer, setActiveLayer] = useState<LayerMode>("heatzones");
  const [eeLoading, setEeLoading] = useState(false);
  const [eeError, setEeError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    (mapRef.current as any)._leaflet_id = null;
    layersRef.current = { heatzones: [], lst: null, ndvi: null };

    initMap();
  }, [data.location.lat, data.location.lng]);

  const initMap = async () => {
    if (!mapRef.current) return;

    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");

    const LIcon = L as any;
    LIcon.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      center: [data.location.lat, data.location.lng],
      zoom: 12,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Base layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // ─── Heat zone circles (default layer) ───
    const heatzoneCircles: any[] = [];
    data.heatZones.forEach((zone) => {
      const color = getHeatColor(zone.intensity);
      const radius = 800 + zone.intensity * 600;
      const circle = L.circle([zone.lat, zone.lng], {
        radius,
        color: "transparent",
        fillColor: color,
        fillOpacity: 0.35,
      }).addTo(map);
      heatzoneCircles.push(circle);
    });
    layersRef.current.heatzones = heatzoneCircles;

    // ─── Center marker ───
    const riskColors: Record<string, string> = {
      High: "#ef4444",
      Medium: "#f59e0b",
      Low: "#22c55e",
    };
    const riskColor = data.mlScore
      ? riskColors[data.mlScore.riskLevel] ?? "#f59e0b"
      : "#9ca3af";

    const centerIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          background: ${riskColor};
          color: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">🌡️</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    L.marker([data.location.lat, data.location.lng], { icon: centerIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: sans-serif; min-width: 180px;">
          <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: bold;">${data.location.city}</h3>
          <p style="margin: 4px 0; font-size: 13px;">🌡️ Temperature: <b>${data.weather.temp}°C</b></p>
          <p style="margin: 4px 0; font-size: 13px;">💧 Humidity: <b>${data.weather.humidity}%</b></p>
          ${data.mlScore ? `
          <p style="margin: 4px 0; font-size: 13px;">⚠️ UHI Risk: <b style="color: ${riskColor}">${data.mlScore.riskLevel}</b></p>
          <p style="margin: 4px 0; font-size: 13px;">📊 Score: <b>${data.mlScore.riskScore}/100</b></p>
          <p style="margin: 4px 0; font-size: 13px;">🏙️ +${data.mlScore.uhi_intensity}°C vs rural</p>
          ` : '<p style="margin: 4px 0; font-size: 13px; color: #6b7280;">⏳ Calculating UHI Risk...</p>'}
        </div>`,
        { maxWidth: 250 }
      )
      .openPopup();

    // High-risk numbered dots
    data.heatZones
      .filter((z) => z.intensity > 0.6)
      .slice(0, 5)
      .forEach((zone, i) => {
        const smallIcon = L.divIcon({
          className: "",
          html: `<div style="
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 20px; height: 20px;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          ">${i + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([zone.lat, zone.lng], { icon: smallIcon })
          .addTo(map)
          .bindPopup(`<b>High Risk Zone ${i + 1}</b><br/>Intensity: ${Math.round(zone.intensity * 100)}%`);
      });

    // Fetch Earth Engine tiles after map loads
    fetchEETiles(L, map);
  };

  const fetchEETiles = async (L: any, map: any) => {
    setEeLoading(true);
    setEeError(null);
    try {
      const res = await fetch(
        `/api/ee-tiles?lat=${data.location.lat}&lng=${data.location.lng}`
      );
      if (!res.ok) throw new Error(`EE API error: ${res.status}`);
      const { lstTileUrl, ndviTileUrl } = await res.json();

      // Create tile layers (hidden by default)
      const lstLayer = L.tileLayer(lstTileUrl, {
        opacity: 0.75,
        attribution: "© Google Earth Engine | MODIS MOD11A1",
        maxNativeZoom: 7,
      });

      const ndviLayer = L.tileLayer(ndviTileUrl, {
        opacity: 0.75,
        attribution: "© Google Earth Engine | MODIS MOD13A1",
        maxNativeZoom: 9,
      });

      layersRef.current.lst = lstLayer;
      layersRef.current.ndvi = ndviLayer;
    } catch (err: any) {
      console.error("Earth Engine tiles failed:", err);
      setEeError("Satellite tiles unavailable");
    } finally {
      setEeLoading(false);
    }
  };

  const switchLayer = (mode: LayerMode) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { heatzones, lst, ndvi } = layersRef.current;

    // Hide all
    heatzones.forEach((c) => map.removeLayer(c));
    if (lst && map.hasLayer(lst)) map.removeLayer(lst);
    if (ndvi && map.hasLayer(ndvi)) map.removeLayer(ndvi);

    // Show selected
    if (mode === "heatzones") {
      heatzones.forEach((c) => c.addTo(map));
    } else if (mode === "lst" && lst) {
      lst.addTo(map);
    } else if (mode === "ndvi" && ndvi) {
      ndvi.addTo(map);
    }

    setActiveLayer(mode);
  };

  const layerBtns: { id: LayerMode; label: string; title: string }[] = [
    { id: "heatzones", label: "🔴 Heat Zones", title: "Calculated UHI heat circles" },
    { id: "lst", label: "🌡️ LST Satellite", title: "Real MODIS Land Surface Temperature" },
    { id: "ndvi", label: "🌿 NDVI Vegetation", title: "Real MODIS Vegetation Density" },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-serif font-bold text-lg text-[var(--foreground)]">🗺️ Urban Heat Map</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {activeLayer === "heatzones" && "Calculated UHI heat concentration zones"}
            {activeLayer === "lst" && "Real satellite Land Surface Temperature (MODIS)"}
            {activeLayer === "ndvi" && "Real satellite vegetation density — NDVI (MODIS)"}
          </p>
        </div>

        {/* Layer Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {layerBtns.map((btn) => (
            <button
              key={btn.id}
              title={btn.title}
              onClick={() => switchLayer(btn.id)}
              disabled={
                (btn.id === "lst" || btn.id === "ndvi") &&
                (!layersRef.current[btn.id] || eeLoading)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLayer === btn.id
                  ? "bg-[var(--accent-fire)] text-white shadow-lg"
                  : "bg-[var(--surface-light)] text-[var(--text-muted)] hover:bg-[var(--surface)] border border-[var(--border)]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {btn.id !== "heatzones" && eeLoading ? "⏳ Loading..." : btn.label}
            </button>
          ))}
          {eeError && (
            <span className="text-xs text-[var(--accent-danger)] ml-1">⚠️ {eeError}</span>
          )}
        </div>
      </div>

      <div ref={mapRef} style={{ height: "400px", width: "100%" }} />

      <div className="p-4 border-t border-[var(--border)] flex items-center gap-6 flex-wrap bg-[var(--surface-light)]">
        {activeLayer === "heatzones" && (
          <>
            <span className="text-xs text-[var(--text-muted)] font-medium">HEAT INTENSITY:</span>
            {[
              { color: "#fef08a", label: "Low" },
              { color: "#fb923c", label: "Medium" },
              { color: "#ef4444", label: "High" },
              { color: "#7f1d1d", label: "Critical" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
          </>
        )}
        {activeLayer === "lst" && (
          <>
            <span className="text-xs text-[var(--text-muted)] font-medium">LAND SURFACE TEMP (°C):</span>
            {[
              { color: "#313695", label: "Cool" },
              { color: "#74add1", label: "Mild" },
              { color: "#fed976", label: "Warm" },
              { color: "#fd8d3c", label: "Hot" },
              { color: "#bd0026", label: "Extreme" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
            <span className="text-xs text-[var(--accent-cool)] ml-auto">Source: MODIS MOD11A1 via GEE</span>
          </>
        )}
        {activeLayer === "ndvi" && (
          <>
            <span className="text-xs text-[var(--text-muted)] font-medium">VEGETATION DENSITY (NDVI):</span>
            {[
              { color: "#d73027", label: "Bare" },
              { color: "#fee08b", label: "Sparse" },
              { color: "#91cf60", label: "Moderate" },
              { color: "#1a9850", label: "Dense" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-[var(--text-muted)]">{label}</span>
              </div>
            ))}
            <span className="text-xs text-[var(--accent-cool)] ml-auto">Source: MODIS MOD13A1 via GEE</span>
          </>
        )}
      </div>
    </div>
  );
}

function getHeatColor(intensity: number): string {
  if (intensity > 0.8) return "#7f1d1d";
  if (intensity > 0.6) return "#ef4444";
  if (intensity > 0.4) return "#fb923c";
  if (intensity > 0.2) return "#fbbf24";
  return "#fef08a";
}

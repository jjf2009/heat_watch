"use client";
import React, { useEffect, useRef, useState } from "react";
import { AppData } from "@/lib/types";
import { Maximize, X } from "lucide-react";

type Props = {
  data: AppData;
};

export default function HeatMap({ data }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCommunity, setShowCommunity] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const communityLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapRef.current) return;

    // If map already exists on this div, remove it first
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Clear any leftover Leaflet state on the div
    (mapRef.current as any)._leaflet_id = null;

    initMap();
  }, [data.location.lat, data.location.lng]);

  // Toggle community layer visibility
  useEffect(() => {
    if (!communityLayerRef.current || !mapInstanceRef.current) return;
    if (showCommunity) {
      communityLayerRef.current.addTo(mapInstanceRef.current);
    } else {
      communityLayerRef.current.remove();
    }
  }, [showCommunity]);

  // Handle map resizing reliably
  useEffect(() => {
    if (!mapRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    
    resizeObserver.observe(mapRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // Community reports layer
    const communityLayer = L.layerGroup().addTo(map);
    communityLayerRef.current = communityLayer;

    // Async: load community markers (non-blocking)
    fetch("/api/community-report")
      .then((r) => r.json())
      .then(({ markers }) => {
        const heatColors = ["#22c55e", "#84cc16", "#f59e0b", "#ef4444", "#7f1d1d"];
        markers?.forEach((m: any) => {
          const color = heatColors[Math.min(m.heatLevel - 1, 4)];
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width:16px;height:16px;border-radius:50%;
              background:${color};border:2px solid white;
              box-shadow:0 2px 6px rgba(0,0,0,0.5);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          L.marker([m.lat, m.lng], { icon })
            .addTo(communityLayer)
            .bindPopup(`<b style="color:#F97316">Community Report</b><br/>🌡️ Heat: <b>${m.heatLevel}/5</b>`);
        });
      })
      .catch(() => {/* silently ignore */});

    // Heat circles
    data.heatZones.forEach((zone) => {
      const color = getHeatColor(zone.intensity);
      const radius = 800 + zone.intensity * 600;

      L.circle([zone.lat, zone.lng], {
        radius,
        color: "transparent",
        fillColor: color,
        fillOpacity: 0.35,
      }).addTo(map);
    });

    // Center marker
    const riskColors: Record<string, string> = {
      High: "#ef4444",
      Medium: "#f59e0b",
      Low: "#22c55e",
    };
    const riskColor = riskColors[data.mlScore.riskLevel] ?? "#f59e0b";

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
          <p style="margin: 4px 0; font-size: 13px;">⚠️ UHI Risk: <b style="color: ${riskColor}">${data.mlScore.riskLevel}</b></p>
          <p style="margin: 4px 0; font-size: 13px;">📊 Score: <b>${data.mlScore.riskScore}/100</b></p>
          <p style="margin: 4px 0; font-size: 13px;">🏙️ +${data.mlScore.uhi_intensity}°C vs rural</p>
        </div>`,
        { maxWidth: 250 }
      )
      .openPopup();

    // Numbered red dots for high risk zones
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
          .bindPopup(
            `<b>High Risk Zone ${i + 1}</b><br/>Intensity: ${Math.round(zone.intensity * 100)}%`
          );
      });
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`transition-all duration-300 flex flex-col ${isFullscreen ? "bg-[#1A1A2E] w-full h-screen" : "relative h-full"}`}
    >
      <div className={`p-4 flex justify-between items-center ${isFullscreen ? "bg-[#1A1A2E] border-b border-white/5" : "bg-transparent border-b border-white/5"}`}>
        <div>
          <h3 className="font-bold text-lg text-white">🗺️ Urban Heat Map</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            Red zones indicate highest heat concentration
          </p>
        </div>
        <button
          onClick={toggleFullscreen}
          className={`nm-btn-orange p-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center ${isFullscreen ? "bg-red-600 shadow-red-900/40" : ""}`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <X size={20} className="text-white" /> : <Maximize size={20} className="text-white" />}
        </button>
      </div>

      <div 
        ref={mapRef} 
        className={`flex-1 w-full ${isFullscreen ? "" : "min-h-[380px]"}`}
        style={{ 
          transition: "height 0.3s ease",
          height: isFullscreen ? "100%" : "100%"
        }} 
      />

      <div className={`p-4 border-t border-white/5 flex items-center gap-3 flex-wrap ${isFullscreen ? "bg-[#1A1A2E]" : "bg-transparent"}`}>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Heat Intensity:</span>
        {[
          { color: "#fef08a", label: "Low" },
          { color: "#fb923c", label: "Medium" },
          { color: "#ef4444", label: "High" },
          { color: "#7f1d1d", label: "Critical" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 nm-inset-sm px-3 py-1.5 rounded-full">
            <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">{label}</span>
          </div>
        ))}
        {/* Community layer toggle */}
        <button
          onClick={() => setShowCommunity((v) => !v)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
            showCommunity
              ? "bg-orange-500/15 border-orange-500/40 text-orange-300"
              : "nm-inset-sm border-white/5 text-gray-500"
          }`}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: showCommunity ? "#F97316" : "#555" }} />
          Community
        </button>
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
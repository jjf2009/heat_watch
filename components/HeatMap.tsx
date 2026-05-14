"use client";
import React, { useEffect, useRef } from "react";
import { AppData } from "@/lib/types";

type Props = {
  data: AppData;
};

export default function HeatMap({ data }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold text-lg">🗺️ Urban Heat Map</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Red zones indicate highest heat concentration
        </p>
      </div>

      <div ref={mapRef} style={{ height: "380px", width: "100%" }} />

      <div className="p-4 border-t flex items-center gap-6 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">HEAT INTENSITY:</span>
        {[
          { color: "#fef08a", label: "Low" },
          { color: "#fb923c", label: "Medium" },
          { color: "#ef4444", label: "High" },
          { color: "#7f1d1d", label: "Critical" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
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
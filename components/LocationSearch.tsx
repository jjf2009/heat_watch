"use client";
import { useState } from "react";
import axios from "axios";
import { LocationData } from "@/lib/types";

type Props = {
  onLocation: (loc: LocationData) => void;
  loading: boolean;
};

export default function LocationSearch({ onLocation, loading }: Props) {
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);

  const searchCity = async () => {
    if (!query.trim()) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: query, format: "json", limit: 1 },
      });
      if (res.data.length === 0) return alert("City not found");
      const { lat, lon, display_name } = res.data[0];
      const city = display_name.split(",")[0];
      const country = display_name.split(",").slice(-1)[0].trim();
      onLocation({ city, country, lat: parseFloat(lat), lng: parseFloat(lon) });
    } catch { alert("Search failed"); }
  };

  const detectFromIP = async () => {
    setDetecting(true);
    try {
      const res = await axios.get("https://ipapi.co/json/");
      const { city, country_name, latitude, longitude } = res.data;
      onLocation({ city, country: country_name, lat: latitude, lng: longitude });
    } catch { alert("Location detection failed"); }
    finally { setDetecting(false); }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      <div className="flex w-full gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCity()}
          placeholder="Enter city name (e.g. Mumbai, Delhi, Pune)"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={searchCity}
          disabled={loading}
          className="bg-orange-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          Analyze
        </button>
      </div>
      <button
        onClick={detectFromIP}
        disabled={detecting || loading}
        className="text-sm text-orange-600 underline underline-offset-2"
      >
        {detecting ? "Detecting..." : "Use my current location"}
      </button>
    </div>
  );
}
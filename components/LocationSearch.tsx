"use client";
import { useState } from "react";
import { LocationData } from "@/lib/types";
import { searchCityLocation, detectLocationFromIP } from "@/lib/location";

type Props = {
  onLocationSelected: (loc: LocationData) => void;
  onAnalyze: () => void;
  hasSelectedLocation: boolean;
  selectedLocationLabel: string;
  loading: boolean;
};

export default function LocationSearch({
  onLocationSelected,
  onAnalyze,
  hasSelectedLocation,
  selectedLocationLabel,
  loading,
}: Props) {
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);

  const searchCity = async () => {
    try {
      const location = await searchCityLocation(query);
      onLocationSelected(location);
    } catch (err: any) {
      alert(err.message || "Search failed");
    }
  };

  const detectFromIP = async () => {
    setDetecting(true);
    try {
      const location = await detectLocationFromIP();
      onLocationSelected(location);
    } catch {
      alert("Location detection failed");
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {/* Search row */}
      <div className="flex w-full gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCity()}
          placeholder="Enter city name (e.g. Mumbai, Delhi, Pune)"
          className="nm-input flex-1 px-4 py-3 text-sm"
        />
        <button
          onClick={searchCity}
          disabled={loading}
          className="nm-btn-orange text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          Find
        </button>
      </div>

      {/* Location status */}
      {hasSelectedLocation ? (
        <p className="text-sm text-orange-400 font-medium">
          📍 Selected: <span className="font-bold text-orange-300">{selectedLocationLabel}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-400">
          Select a location, then click Analyze.
        </p>
      )}

      {/* Detect location */}
      <button
        onClick={detectFromIP}
        disabled={detecting || loading}
        className="nm-btn-ghost text-sm text-orange-500 hover:text-orange-400 underline underline-offset-2 disabled:opacity-50"
      >
        {detecting ? "Detecting…" : "📡 Use my current location"}
      </button>

      {/* Analyze */}
      <button
        onClick={onAnalyze}
        disabled={!hasSelectedLocation || loading}
        className="nm-btn-orange text-white px-10 py-3.5 rounded-2xl text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed w-full"
      >
        {loading ? "Analyzing…" : "🔍 Analyze"}
      </button>
    </div>
  );
}

"use client";
import { useState } from "react";
import axios from "axios";
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
          Find
        </button>
      </div>

      {hasSelectedLocation ? (
        <p className="text-sm text-gray-700">
          Selected:{" "}
          <span className="font-semibold">{selectedLocationLabel}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Select a location, then click Analyze.
        </p>
      )}

      <button
        onClick={detectFromIP}
        disabled={detecting || loading}
        className="text-sm text-orange-600 underline underline-offset-2"
      >
        {detecting ? "Detecting..." : "Use my current location"}
      </button>

      <button
        onClick={onAnalyze}
        disabled={!hasSelectedLocation || loading}
        className="bg-red-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}

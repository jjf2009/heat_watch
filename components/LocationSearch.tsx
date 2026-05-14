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
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
      <div className="flex w-full gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCity()}
          placeholder="Enter city name (e.g. Mumbai, Delhi, Pune)"
          className="flex-1 bg-[var(--surface-light)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-fire)]"
          suppressHydrationWarning
        />
        <button
          onClick={searchCity}
          disabled={loading}
          className="bg-[var(--accent-fire)] hover:bg-[var(--accent-heat)] text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
          suppressHydrationWarning
        >
          Find
        </button>
      </div>

      {hasSelectedLocation ? (
        <p className="text-sm text-[var(--text-muted)]">
          Selected:{" "}
          <span className="font-semibold text-[var(--foreground)]">{selectedLocationLabel}</span>
        </p>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          Select a location, then click Analyze.
        </p>
      )}

      <button
        onClick={detectFromIP}
        disabled={detecting || loading}
        className="text-sm text-[var(--accent-fire)] underline underline-offset-2 hover:opacity-70 disabled:opacity-50"
        suppressHydrationWarning
      >
        {detecting ? "Detecting..." : "Use my current location"}
      </button>

      <button
        onClick={onAnalyze}
        disabled={!hasSelectedLocation || loading}
        className="bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-danger)] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {loading ? "Analyzing..." : "Analyze Heat Patterns"}
      </button>
    </div>
  );
}

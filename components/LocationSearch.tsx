"use client";
import { useState } from "react";
import axios from "axios";
import { LocationData } from "@/lib/types";
import {
  searchCityLocation,
  detectLocationFromIP,
} from "@/lib/location";
type Props = {
  onLocation: (loc: LocationData) => void;
  loading: boolean;
};

export default function LocationSearch({ onLocation, loading }: Props) {
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);

const searchCity = async () => {
  try {
    const location = await searchCityLocation(query);
    onLocation(location);
  } catch (err: any) {
    alert(err.message || "Search failed");
  }
};

const detectFromIP = async () => {
  setDetecting(true);

  try {
    const location = await detectLocationFromIP();
    onLocation(location);
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
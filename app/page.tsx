"use client";

import { useEffect, useState } from "react";
import ExportPDF from "@/components/ExportPDF";
import Charts from "@/components/Charts";
import { AppData } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analyze-heat?city=Mumbai");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20">
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        <header className="flex flex-col items-start gap-4 mb-4">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            HeatWatch Dashboard
          </h1>
          <p className="text-gray-500">Urban Heat Island Prediction System</p>
        </header>

        {loading && (
          <div className="flex flex-col gap-6 w-full">
            {/* Risk banner skeleton */}
            <div className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            {/* Map + weather row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            </div>
            <p className="text-center text-gray-400 text-sm animate-pulse">
              🌡️ Fetching climate data and running UHI model...
            </p>
          </div>
        )}

        {!loading && data && (
          <div id="report-content" className="flex flex-col gap-8">
            <ExportPDF data={data} />
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold mb-2">Location Data</h2>
              <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto">
                {JSON.stringify(data.location, null, 2)}
              </pre>
            </div>

            <div id="charts-section" style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", color: "#171717" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>UHI Forecast & Charts</h2>
              <Charts data={data} />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

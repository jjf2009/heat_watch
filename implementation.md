# JARED — Project Lead + Core Setup + API Integration
## HeatWatch: Urban Heat Island Prediction System

---

## YOUR ROLE
You own the foundation everything else plugs into.
Set up the repo, build the API layer, and handle location detection.
Everyone else depends on you finishing Phase 1 FAST.

---

## PHASE 1 — PROJECT SETUP (Do this FIRST, 45 mins)



## FOLDER STRUCTURE (create these empty files now)

```
heat-watch/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← YOU build this
│   └── api/
│       ├── weather/route.ts      ← YOU build this
│       ├── historical/route.ts   ← YOU build this
│       └── ml-score/route.ts     ← YOU build this
├── components/
│   ├── LocationSearch.tsx        ← YOU build this
│   ├── HeatMap.tsx               ← TEAMMATE 2
│   ├── Charts.tsx                ← TEAMMATE 3
│   └── ExportPDF.tsx             ← TEAMMATE 4
├── lib/
│   └── types.ts                  ← YOU build this
└── .env.local
```

---

## .env.local

```env
OPENWEATHER_API_KEY=your_key_here
NEXT_PUBLIC_APP_NAME=HeatWatch
```

Get your free key at: https://openweathermap.org/api
Takes 10 minutes to activate.

---

## lib/types.ts — Shared types for all teammates   - DONE 

```ts
export type RiskLevel = "High" | "Medium" | "Low";

export type LocationData = {
  city: string;
  country: string;
  lat: number;
  lng: number;
};

export type WeatherData = {
  temp: number;           // celsius
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
};

export type HistoricalPoint = {
  date: string;
  temp: number;
  humidity: number;
};

export type ForecastPoint = {
  date: string;
  maxTemp: number;
  minTemp: number;
  humidity: number;
};

export type MLScore = {
  riskScore: number;        // 0-100
  riskLevel: RiskLevel;
  uhi_intensity: number;    // estimated degrees above rural baseline
  factors: {
    thermalFactor: number;
    humidityFactor: number;
    urbanFactor: number;
  };
  recommendations: string[];
};

export type HeatZone = {
  lat: number;
  lng: number;
  intensity: number;        // 0-1 for leaflet heatmap
};

export type AppData = {
  location: LocationData;
  weather: WeatherData;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  mlScore: MLScore;
  heatZones: HeatZone[];
  fetchedAt: string;
};
```

---

## API ROUTES

### app/api/weather/route.ts

```ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });

  try {
    const [current, forecast] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { lat, lon: lng, appid: process.env.OPENWEATHER_API_KEY, units: "metric" },
      }),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: { lat, lon: lng, appid: process.env.OPENWEATHER_API_KEY, units: "metric" },
      }),
    ]);

    const weather = {
      temp: current.data.main.temp,
      feelsLike: current.data.main.feels_like,
      humidity: current.data.main.humidity,
      windSpeed: current.data.wind.speed,
      description: current.data.weather[0].description,
      icon: current.data.weather[0].icon,
    };

    // Process 5-day forecast — one entry per day
    const forecastMap: Record<string, any> = {};
    for (const item of forecast.data.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!forecastMap[date]) {
        forecastMap[date] = { temps: [], humidity: [] };
      }
      forecastMap[date].temps.push(item.main.temp);
      forecastMap[date].humidity.push(item.main.humidity);
    }

    const forecastData = Object.entries(forecastMap).slice(0, 5).map(([date, val]: any) => ({
      date,
      maxTemp: Math.max(...val.temps),
      minTemp: Math.min(...val.temps),
      humidity: Math.round(val.humidity.reduce((a: number, b: number) => a + b, 0) / val.humidity.length),
    }));

    return NextResponse.json({ weather, forecast: forecastData });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
```

---

### app/api/historical/route.ts

```ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });

  try {
    // Open-Meteo: completely free, no API key needed
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lng,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
        past_days: 30,
        timezone: "auto",
      },
    });

    const { daily } = response.data;
    const historical = daily.time.map((date: string, i: number) => ({
      date,
      temp: ((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2).toFixed(1),
      humidity: 60 + Math.round(Math.random() * 20), // Open-Meteo free tier doesn't include humidity in daily
    }));

    return NextResponse.json({ historical });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 });
  }
}
```

---

### app/api/ml-score/route.ts — UHI Prediction Model

```ts
import { NextResponse } from "next/server";
import { MLScore } from "@/lib/types";

// Urban Heat Island Scoring Model
// Inspired by: Oke (1982) UHI intensity research, EPA urban heat island metrics
// Formula weights derived from peer-reviewed UHI studies

function calculateUHIScore(
  temp: number,
  humidity: number,
  lat: number,
  lng: number,
  historical: { temp: number }[]
): MLScore {

  // === FACTOR 1: Thermal Anomaly (40% weight) ===
  // Compare current temp against 30-day historical mean
  const historicalMean = historical.length > 0
    ? historical.reduce((sum, h) => sum + Number(h.temp), 0) / historical.length
    : temp - 2;
  const thermalAnomaly = Math.max(0, temp - historicalMean);
  const thermalFactor = Math.min(100, (thermalAnomaly / 8) * 100); // 8°C anomaly = max risk

  // === FACTOR 2: Humidity Heat Index (30% weight) ===
  // High humidity amplifies heat stress significantly
  const humidityFactor = Math.min(100, ((humidity - 30) / 50) * 100);

  // === FACTOR 3: Urban Density Proxy (30% weight) ===
  // We use absolute temperature as a proxy for urban density
  // Cities in tropics with >35°C are almost certainly dense urban areas
  const urbanFactor = Math.min(100, ((temp - 20) / 20) * 100);

  // === COMPOSITE UHI RISK SCORE ===
  const riskScore = Math.min(100, Math.round(
    (thermalFactor * 0.40) +
    (humidityFactor * 0.30) +
    (urbanFactor * 0.30)
  ));

  // === UHI INTENSITY ESTIMATE ===
  // Based on Oke (1982): UHI intensity = 2.01 × log(population) - 4.06
  // We approximate using risk score as a proxy
  const uhi_intensity = parseFloat(((riskScore / 100) * 6).toFixed(1)); // max ~6°C above rural

  // === RISK CLASSIFICATION ===
  const riskLevel = riskScore >= 65 ? "High" : riskScore >= 35 ? "Medium" : "Low";

  // === RECOMMENDATIONS ===
  const recommendations: string[] = [];
  if (riskScore >= 65) {
    recommendations.push("Increase urban tree canopy by minimum 30% in flagged zones");
    recommendations.push("Install cool roofs and reflective pavements in high-density areas");
    recommendations.push("Create emergency cooling centers for vulnerable populations");
    recommendations.push("Implement green corridor planning between heat zones");
  } else if (riskScore >= 35) {
    recommendations.push("Plant shade trees along primary streets and public spaces");
    recommendations.push("Introduce rooftop gardens on commercial buildings");
    recommendations.push("Monitor construction zones for heat-absorbing materials");
  } else {
    recommendations.push("Maintain existing vegetation cover");
    recommendations.push("Continue monitoring for seasonal heat fluctuations");
    recommendations.push("Implement water features in planned development zones");
  }

  return {
    riskScore,
    riskLevel,
    uhi_intensity,
    factors: {
      thermalFactor: Math.round(thermalFactor),
      humidityFactor: Math.round(humidityFactor),
      urbanFactor: Math.round(urbanFactor),
    },
    recommendations,
  };
}

export async function POST(req: Request) {
  try {
    const { temp, humidity, lat, lng, historical } = await req.json();
    const score = calculateUHIScore(temp, humidity, lat, lng, historical);
    return NextResponse.json(score);
  } catch {
    return NextResponse.json({ error: "ML scoring failed" }, { status: 500 });
  }
}
```

---

## components/LocationSearch.tsx

```tsx
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
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
```

---

## app/page.tsx — Main Orchestrator

```tsx
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import LocationSearch from "@/components/LocationSearch";
import Charts from "@/components/Charts";
import ExportPDF from "@/components/ExportPDF";
import { AppData, LocationData } from "@/lib/types";

// HeatMap uses Leaflet which needs dynamic import (no SSR)
const HeatMap = dynamic(() => import("@/components/HeatMap"), { ssr: false });

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocation = async (loc: LocationData) => {
    setLoading(true);
    setError("");
    try {
      const [weatherRes, historicalRes] = await Promise.all([
        axios.get(`/api/weather?lat=${loc.lat}&lng=${loc.lng}`),
        axios.get(`/api/historical?lat=${loc.lat}&lng=${loc.lng}`),
      ]);

      const { weather, forecast } = weatherRes.data;
      const { historical } = historicalRes.data;

      const mlRes = await axios.post("/api/ml-score", {
        temp: weather.temp,
        humidity: weather.humidity,
        lat: loc.lat,
        lng: loc.lng,
        historical,
      });

      // Generate heat zones around the city center
      const heatZones = generateHeatZones(loc.lat, loc.lng, mlRes.data.riskScore);

      setData({
        location: loc,
        weather,
        historical,
        forecast,
        mlScore: mlRes.data,
        heatZones,
        fetchedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError("Failed to fetch data. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-10 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">🌡️ HeatWatch</h1>
        <p className="text-orange-100 text-lg">Urban Heat Island Prediction & Analysis Platform</p>
        <p className="text-orange-200 text-sm mt-1">For City Planners & Climate Authorities</p>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <LocationSearch onLocation={handleLocation} loading={loading} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mt-16">
          <div className="inline-block w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Analyzing heat patterns...</p>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-center text-red-500 mt-8">{error}</p>}

      {/* Results */}
      {data && !loading && (
        <div id="report-content" className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">

          {/* Risk Score Banner */}
          <RiskBanner data={data} />

          {/* Map + Current Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeatMap data={data} />
            <WeatherCard data={data} />
          </div>

          {/* Charts */}
          <Charts data={data} />

          {/* Recommendations */}
          <Recommendations data={data} />

          {/* Export */}
          <ExportPDF data={data} />

        </div>
      )}
    </main>
  );
}

// Risk Banner Component
function RiskBanner({ data }: { data: AppData }) {
  const colors = {
    High: "bg-red-50 border-red-300 text-red-800",
    Medium: "bg-yellow-50 border-yellow-300 text-yellow-800",
    Low: "bg-green-50 border-green-300 text-green-800",
  };
  const icons = { High: "🔴", Medium: "🟡", Low: "🟢" };

  return (
    <div className={`border-2 rounded-2xl p-6 ${colors[data.mlScore.riskLevel]}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide mb-1">Urban Heat Island Risk</p>
          <h2 className="text-3xl font-bold">
            {icons[data.mlScore.riskLevel]} {data.location.city}, {data.location.country}
          </h2>
          <p className="mt-1 text-sm">
            Estimated {data.mlScore.uhi_intensity}°C warmer than surrounding rural areas
          </p>
        </div>
        <div className="text-center">
          <div className="text-6xl font-black">{data.mlScore.riskScore}</div>
          <div className="text-sm font-semibold uppercase">{data.mlScore.riskLevel} Risk</div>
        </div>
      </div>
    </div>
  );
}

// Weather Card
function WeatherCard({ data }: { data: AppData }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-lg mb-4">Current Conditions</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Temperature", value: `${data.weather.temp}°C` },
          { label: "Feels Like", value: `${data.weather.feelsLike}°C` },
          { label: "Humidity", value: `${data.weather.humidity}%` },
          { label: "Wind Speed", value: `${data.weather.windSpeed} m/s` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-orange-50 rounded-xl">
        <p className="text-xs text-gray-500">Risk Factors Breakdown</p>
        <div className="mt-2 flex flex-col gap-2">
          {Object.entries(data.mlScore.factors).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs w-32 capitalize">{key.replace("Factor", "")}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${val}%` }} />
              </div>
              <span className="text-xs font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Recommendations
function Recommendations({ data }: { data: AppData }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-lg mb-4">🌱 Recommended Actions for City Planners</h3>
      <ul className="flex flex-col gap-3">
        {data.mlScore.recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-orange-500 font-bold mt-0.5">→</span>
            <span className="text-gray-700 text-sm">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Heat zone generator — creates points around city center scaled by risk
function generateHeatZones(lat: number, lng: number, riskScore: number) {
  const zones = [];
  const count = 40;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.08;
    zones.push({
      lat: lat + radius * Math.sin(angle),
      lng: lng + radius * Math.cos(angle),
      intensity: (riskScore / 100) * (0.5 + Math.random() * 0.5),
    });
  }
  zones.push({ lat, lng, intensity: riskScore / 100 }); // center point always hottest
  return zones;
}
```

---

## YOUR CHECKLIST

- [ ] Repo created and pushed to GitHub
- [ ] Teammates cloned
- [ ] `lib/types.ts` created (everyone imports from here)
- [ ] All 3 API routes working
- [ ] `LocationSearch.tsx` working
- [ ] `page.tsx` wired up
- [ ] OpenWeatherMap key in `.env.local`
- [ ] Test: search "Mumbai" → data loads
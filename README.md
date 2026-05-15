# HeatWatch 🌡️

## Team Name
[Enter Team Name Here]

## Problem Statement
Urban heat islands pose a significant threat to public health and city infrastructure. City planners, climate authorities, and environmental scientists lack unassailable, data-backed insights combining real-time ground telemetry with satellite data to predict, analyze, and mitigate these heat anomalies effectively.

## Team Members
- Jared Furtado
- PRATHAMESH VASANTRAO NAIK
- SOHAM PRAMOD PENDSE
- WALSH FRANCIS D'SOUZA

## Project Description
HeatWatch is a Next.js application that fuses real-time NASA MODIS satellite data with ground telemetry and an ONNX-powered ML model to predict and analyze urban heat island effects. It provides science-grade climatological predictions, interactive mapping, and comprehensive reporting. 

## Features
- **Satellite-Ground Composite Index:** Fuses real-time NASA MODIS satellite data (via Google Earth Engine) with local ground telemetry for precise risk calculations.
- **Science-Grade Climatological Predictions:** Leverages an ONNX-powered ML model (`uhi_model.onnx`) to predict Urban Heat Island (UHI) intensity and establish baseline risks.
- **Interactive Heat Mapping:** Dynamically visualizes heat zones, anomalies, and risk factors on a responsive Leaflet-powered map.
- **AI Chatbot Integration:** Embedded AI assistant for answering natural language queries about UHI conditions.
- **Intervention Simulator:** Interactive sliders to mock environmental changes (e.g. planting trees, changing albedo) and view projected outcomes.
- **Professional Export Suite:** Generates authoritative, unassailable climatological reports in PDF and CSV formats.

## Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Chart.js, Leaflet (`react-leaflet`, `leaflet.heat`)
- **Backend:** Next.js API Routes, Node.js, ONNX Runtime Node (`onnxruntime-node`), AI SDK with Groq (`@ai-sdk/groq`)
- **Database:** Firebase v12 (Authentication & DB), Next-Auth
- **APIs:** Google Earth Engine (`@google/earthengine`), OpenWeatherMap, Open-Meteo, Nominatim (OSM)

## Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository>
   cd pcce_ecell_hackathon
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   OPENWEATHER_API_KEY=your_key_here
   NEXT_PUBLIC_APP_NAME=HeatWatch
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   ```
   *Ensure your Google Earth Engine Service Account file (`gee-key.json`) is placed in the root directory.*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Usage Instructions
1. Navigate to the homepage (http://localhost:3000) and enter a city name to search.
2. The platform automatically fetches weather, historical data, and Earth Engine tiles.
3. View the generated UHI Risk Score calculated by the ONNX ML model.
4. Interact with the Heat Map and Intervention Simulator to explore mitigation strategies.
5. Authenticate via Firebase to access the `/report` route.
6. Click "Export PDF" to generate and download a professional client-side report.

## Screenshots
![HeatWatch Screenshot](./screenshots.jpeg)

## Demo Video
*[Watch the demo video](https://youtu.be/WJ-XbMYJ0LE)*

## Future Scope
- Expand ML model features to predict multi-day heatwave severities.
- Add real-time traffic overlay data to determine emission-based heat correlations.
- Implement user-saved reports and dashboard customization via Firebase Firestore.

---

## Agent-Friendly File Architecture

This section details the explicit purpose, inputs, and outputs of every major file in the system to assist AI agents in navigating the codebase.

### `/app` (Routing & Pages)
| File / Directory | Purpose | Input | Output |
|------------------|---------|-------|--------|
| `layout.tsx` | Root Next.js layout, applies global fonts and CSS. | React children nodes. | HTML document structure. |
| `page.tsx` | Main application dashboard aggregating map, charts, and risk scores. | User interactions, API responses. | Rendered React Dashboard. |
| `report/page.tsx`| Dedicated report generation and viewing page. | User/Auth context. | Rendered Report UI. |
| `globals.css` | Global styles and Tailwind CSS v4 directives. | N/A | Global CSS rules. |
| `api/weather/route.ts` | API route fetching live OpenWeatherMap data. | `lat`, `lng` (Query Params). | JSON: Current temp, humidity, wind. |
| `api/historical/route.ts` | API route fetching 30-day Open-Meteo history. | `lat`, `lng` (Query Params). | JSON: Time-series temp/humidity arrays. |
| `api/ee-tiles/route.ts` | Serves Google Earth Engine map tile URLs. | `lat`, `lng` | JSON: Tile URLs for Leaflet rendering. |
| `api/uhi-engine/route.ts` | Core ML API invoking ONNX model & Groq AI. | Weather payload, historical data. | JSON: UHI Risk Score, anomalies. |
| `api/map-data/route.ts` | Returns GeoJSON points for Leaflet. | `lat`, `lng` | JSON: GeoJSON heat layers. |

### `/lib` (Core Logic & Utilities)
| File | Purpose | Input | Output |
|------|---------|-------|--------|
| `types.ts` | Shared TypeScript interfaces. | N/A | Type definitions (`LocationData`, `MLScore`, etc.). |
| `firebase.ts` | Firebase client initialization. | Environment variables. | Firebase App instance. |
| `auth-context.tsx` | React Context for managing user authentication state. | Auth state. | AuthContext Provider. |
| `useAuthGate.ts` | Hook for protecting routes behind authentication. | User state. | Redirects or Access grant. |
| `onnxModel.ts` | Interface for `uhi_model.onnx` inference. | Normalized environmental vectors. | Floating point predictions (Base risk). |
| `earthEngine.ts` | Google Earth Engine authentication and dataset querying. | `gee-key.json` credentials, bbox. | Geospatial image collections/tiles. |
| `nasa.ts` | Wraps MODIS data fetching and processing. | Coordinates and time range. | Thermal anomaly datasets. |
| `mlScore.ts` | Heuristics and composite risk calculations. | Current/Historical/Satellite data. | Composite Risk Score (0-100). |
| `regression.ts` | Statistical trend calculations for charts. | Array of data points. | Line of best fit predictions. |
| `intervention.ts`| Simulates effects of planting trees, changing albedo. | Current data, intervention params. | Projected delta in temp/score. |
| `weather.ts` | OpenWeatherMap client logic. | `lat`, `lng`. | Standardized weather object. |
| `historical.ts`| Open-Meteo client logic. | `lat`, `lng`. | Standardized time-series object. |
| `location.ts` | Geocoding via Nominatim. | City Name (String). | Coordinates (`lat`, `lng`). |
| `detectLocation.ts`| IP Geolocation fallback via IPapi. | HTTP Request context (IP). | Guessed Coordinates. |
| `heatZones.ts` | Logic to classify temperature zones. | Temperature value. | Color/Zone string (e.g. Red, Severe). |
| `recommendations.ts`| AI/Heuristic text suggestions for mitigation. | Risk score. | Array of mitigation strings. |

### `/components` (UI Components)
| File | Purpose | Input (Props) | Output (Render) |
|------|---------|---------------|-----------------|
| `ChatBot.tsx` | AI chatbot interface for UHI queries. | User text input. | Chat messages UI. |
| `ReportMap.tsx`| Static map for the generated PDF reports. | Location data. | Map `<canvas>` / SVG UI. |
| `LoginModal.tsx`| Modal for user authentication. | Firebase Auth state. | Login form UI. |
| `PricingCard.tsx`| Displays subscription/pricing tiers. | Pricing data. | Card UI. |
| `Navbar.tsx` | Main navigation header. | Navigation routes. | Header UI. |
| `HeatMap.tsx` | Leaflet interactive map with Heat/EE overlays. | `lat`, `lng`, `heatData`, `eeTiles`. | Interactive DOM Map element. |
| `Charts.tsx` | Time-series and radar risk charts using Chart.js. | `historicalData`, `forecastData`. | `<canvas>` chart renders. |
| `ExportPDF.tsx`| Client-side report generation using jsPDF. | `appData` (all fetched context). | Triggers file download (.pdf). |
| `LocationSearch.tsx`| Geocoding input field with IP auto-detect. | `onLocationSelect` callback. | Search input UI. |
| `ONNXInsight.tsx`| Displays raw ONNX inference and AI explanation. | `onnxResult`, `aiExplanation`. | Insights panel UI. |
| `InterventionSimulator.tsx`| Interactive sliders to mock environmental changes. | `baseScore`, `onSimulate`. | Sliders and projected score UI. |
| `RegressionForecast.tsx`| Visualizes future heat trends based on regression. | `trendData`. | Trend graph UI. |
| `PeakHourPanel.tsx`| Displays times of highest thermal risk. | Hourly forecast data. | Info card UI. |
| `UHIDeltaPanel.tsx`| Compares rural baseline vs urban current temp. | Ground temp, baseline temp. | Differential UI panel. |

### Root Configuration Files
| File | Purpose | Input | Output |
|------|---------|-------|--------|
| `package.json` | Dependency tree & scripts. | Node/npm. | Environment setup. |
| `uhi_model.onnx`| Pre-trained Science-Grade prediction model. | Tensor (Float32Array). | Tensor (Float32Array). |
| `gee-key.json` | Google Cloud service account keys. | Earth Engine SDK. | Auth tokens. |

## System Architecture Flow
1. **User Input:** `LocationSearch.tsx` triggers Geocoding via `location.ts`.
2. **Parallel Fetch:** Client requests `/api/weather`, `/api/historical`, and `/api/ee-tiles`.
3. **Inference Flow:** `/api/uhi-engine` aggregates weather & NASA data, passes it to `onnxModel.ts`, and returns the composite risk score.
4. **Auth & Report:** Users authenticate via Firebase (`LoginModal.tsx` / `auth-context.tsx`). Authenticated users can access `/report`.
5. **Render:** React state updates, triggering re-renders of `HeatMap.tsx`, `Charts.tsx`, `ONNXInsight.tsx`, and `ChatBot.tsx`.
6. **Export:** User clicks "Export PDF" -> `ExportPDF.tsx` captures the DOM with `html2canvas` -> creates a multipage PDF via `jsPDF`.

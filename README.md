# HeatWatch 🌡️

**Urban Heat Island Prediction & Analysis Platform**

A Next.js application that predicts and analyzes urban heat island effects for city planners and climate authorities. The system detects user locations, fetches real-time weather data, analyzes historical trends, calculates heat risk scores using ML algorithms, and visualizes heat zones on interactive maps.

---

## 📁 Project Structure & File Guide

### 🔧 Root Configuration Files

| File                     | Purpose                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`package.json`**       | Defines project dependencies and scripts. Contains Next.js, React, Leaflet (mapping), Chart.js (data visualization), and utility libraries. Run `npm run dev` to start development server. |
| **`tsconfig.json`**      | TypeScript configuration for type checking and compilation settings. Enables strict type checking and path aliases (`@/` prefix).                                                          |
| **`next.config.ts`**     | Next.js configuration file. Contains build and runtime settings specific to the Next.js framework.                                                                                         |
| **`eslint.config.mjs`**  | ESLint configuration for code linting. Enforces code quality and consistency standards across the project.                                                                                 |
| **`postcss.config.mjs`** | PostCSS configuration for Tailwind CSS processing. Transforms CSS and applies Tailwind utilities.                                                                                          |
| **`tailwind.config.ts`** | Tailwind CSS configuration. Customizes color schemes, spacing, and other design tokens (if present).                                                                                       |
| **`next-env.d.ts`**      | Auto-generated TypeScript declarations for Next.js. Do not edit manually.                                                                                                                  |
| **`.env.local`**         | Environment variables (create this file). Store `OPENWEATHER_API_KEY` and `NEXT_PUBLIC_APP_NAME` here.                                                                                     |

---

### 📄 App Folder (`app/`)

#### Main Pages

| File              | Purpose                                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`layout.tsx`**  | Root layout component wrapping all pages. Sets up HTML structure, fonts (Geist), global CSS imports, and metadata. Provides consistent styling across the app.                                                              |
| **`page.tsx`**    | Home page (main UI). The core interface where users search locations, view real-time weather, historical trends, ML risk scores, and heat zone visualizations. Handles data fetching from API routes and manages app state. |
| **`globals.css`** | Global CSS styles. Contains Tailwind CSS directives and any custom global styling applied to all pages.                                                                                                                     |

#### API Routes (`app/api/`)

API endpoints that handle backend logic:

| Route                       | Purpose                                                                                                                                                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`weather/route.ts`**      | Fetches current weather & 5-day forecast from OpenWeatherMap API. Takes `lat` and `lng` query params. Returns temperature, humidity, wind speed, and forecast data in metric units.                                                                                     |
| **`historical/route.ts`**   | Fetches 30 days of historical weather data using Open-Meteo free API (no key required). Returns historical temperature and humidity trends for the given coordinates. Used for calculating thermal anomalies.                                                           |
| **`ml-score/route.ts`**     | Calculates Urban Heat Island (UHI) risk score based on current weather, historical data, and location. Uses weighted formula: 40% thermal anomaly, 30% humidity factor, 30% urban density proxy. Returns risk level (High/Medium/Low) and personalized recommendations. |
| **`map-data/route.ts`**     | Returns GeoJSON data for heat zone visualization on the map. Generates mock GeoJSON features with intensity and temperature properties for the given location.                                                                                                          |
| **`analyze-heat/route.ts`** | Analyzes heat patterns and returns detailed analytics. Processes location-specific data, weather conditions, and ML risk scores for in-depth heat analysis.                                                                                                             |

---

### 🎨 Components Folder (`components/`)

Reusable React components for the UI:

| Component                | Purpose                                                                                                                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`LocationSearch.tsx`** | Search input component. Allows users to search cities by name using Nominatim (OpenStreetMap) or detect location via IP. Emits selected location back to parent via `onLocation` callback.                                                      |
| **`HeatMap.tsx`**        | Interactive map visualization using Leaflet + Leaflet.heat plugin. Renders heat zones on a map centered at the searched location. Uses OpenStreetMap tiles and dynamically loads client-side (no SSR) to handle Leaflet's browser dependencies. |
| **`Charts.tsx`**         | Data visualization component using Chart.js. Displays multiple chart types: Line chart for historical temperature trends with 7-day rolling average, Bar chart for forecast comparison, and Radar chart for risk factor analysis.               |
| **`ExportPDF.tsx`**      | PDF export functionality using jsPDF + html2canvas. Generates a multi-page professional report with location summary, risk assessment, charts, recommendations, and timestamps. Downloads as "HeatWatch_Report.pdf".                            |

---

### 📚 Lib Folder (`lib/`)

Utilities and shared type definitions:

| File                    | Purpose                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`types.ts`**          | Central TypeScript type definitions shared across the entire app. Defines: `LocationData` (coordinates), `WeatherData` (current conditions), `HistoricalPoint` (past data), `ForecastPoint` (predictions), `MLScore` (risk calculations), `HeatZone` (map visualization), and `AppData` (combined data structure). |
| **`location.ts`**       | Location utilities. Contains `searchCityLocation()` function that queries Nominatim API for city coordinates by name, and `detectLocationFromIP()` function that uses IPapi.co to auto-detect user's current location.                                                                                             |
| **`detectLocation.ts`** | IP-based location detection. Utility function that detects user's city, country, and coordinates from their public IP address. Used as fallback when location search fails.                                                                                                                                        |

---

### 📦 Public Folder (`public/`)

Static assets served directly by Next.js. Can include images, icons, fonts, and other files that don't change.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Free API key from OpenWeatherMap (https://openweathermap.org/api)

### Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create `.env.local` file:**

   ```env
   OPENWEATHER_API_KEY=your_api_key_here
   NEXT_PUBLIC_APP_NAME=HeatWatch
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔄 Data Flow

```
User Searches Location (or auto-detects via IP)
    ↓
LocationSearch Component → location.ts (Nominatim API)
    ↓
page.tsx calls handleLocation()
    ↓
Parallel API Calls:
├── /api/weather → OpenWeatherMap (current + forecast)
├── /api/historical → Open-Meteo (30-day historical)
└── /api/ml-score → Calculates UHI risk score
    ↓
Data aggregated into AppData state
    ↓
Components Render:
├── HeatMap (Leaflet visualization)
├── Charts (Historical & forecast trends)
├── Weather card (Current conditions)
└── Recommendations (Based on risk score)
    ↓
ExportPDF can download entire report
```

---

## 🛠 Key Technologies

| Technology                  | Usage                                                            |
| --------------------------- | ---------------------------------------------------------------- |
| **Next.js 16**              | React framework with built-in API routes, SSR, and optimizations |
| **React 19**                | UI component library                                             |
| **TypeScript**              | Type-safe JavaScript                                             |
| **Tailwind CSS 4**          | Utility-first CSS framework for styling                          |
| **Leaflet + react-leaflet** | Interactive map library                                          |
| **Chart.js**                | Data visualization and charting                                  |
| **jsPDF + html2canvas**     | PDF generation and export                                        |
| **Axios**                   | HTTP client for API calls                                        |
| **OpenWeatherMap API**      | Current weather and 5-day forecast data                          |
| **Open-Meteo API**          | Free historical weather data (no key required)                   |
| **Nominatim (OSM)**         | City name to coordinates geocoding                               |
| **IPapi.co**                | IP-based location detection                                      |

---

## 📊 ML Risk Scoring Algorithm

The `ml-score` endpoint calculates Urban Heat Island risk using this formula:

```
Risk Score = (40% × Thermal Anomaly) + (30% × Humidity Factor) + (30% × Urban Density Proxy)

Where:
- Thermal Anomaly = Current temp - 30-day average (max risk at +8°C)
- Humidity Factor = (Current humidity - 30%) / 50% (0-100 scale)
- Urban Density = (Current temp - 20°C) / 20°C (proxy based on absolute temp)

UHI Intensity = (Risk Score / 100) × 6°C (estimated degrees above rural baseline)

Risk Levels:
- High: Score ≥ 65
- Medium: 35 ≤ Score < 65
- Low: Score < 35
```

---

## 📝 Environment Variables

| Variable               | Required | Purpose                                                     |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `OPENWEATHER_API_KEY`  | Yes      | API key for OpenWeatherMap API (current & forecast weather) |
| `NEXT_PUBLIC_APP_NAME` | No       | Public app name (default: "HeatWatch")                      |

---

## 🔐 External APIs & Data Sources

| API             | Purpose                          | Auth                | Cost                   |
| --------------- | -------------------------------- | ------------------- | ---------------------- |
| OpenWeatherMap  | Current weather & 5-day forecast | API Key (free tier) | Free for development   |
| Open-Meteo      | 30-day historical weather        | None                | Free (no limits)       |
| Nominatim (OSM) | City name → coordinates          | None                | Free (rate-limited)    |
| IPapi.co        | IP → location detection          | None                | Free (generous limits) |
| OpenStreetMap   | Map tiles                        | None                | Free (CC license)      |

---

## 📋 Features

✅ **Location Detection**: Auto-detect via IP or search by city name  
✅ **Real-time Weather**: Current conditions, wind, humidity from OpenWeatherMap  
✅ **Historical Analysis**: 30-day temperature and humidity trends  
✅ **ML Risk Scoring**: Calculate Urban Heat Island intensity using weighted algorithms  
✅ **Heat Zone Mapping**: Visualize heat zones on interactive Leaflet map  
✅ **Data Visualization**: Historical trends, forecast predictions, and risk factors via charts  
✅ **PDF Export**: Generate professional multi-page heat analysis reports  
✅ **Responsive Design**: Mobile-friendly UI with Tailwind CSS  
✅ **Recommendations**: Personalized suggestions based on risk level

---

## 🎯 Use Cases

- **City Planners**: Monitor urban heat island hotspots and plan mitigation strategies
- **Climate Authorities**: Track heat-related public health risks
- **Environmental Scientists**: Analyze historical UHI trends and patterns
- **Real Estate Developers**: Assess thermal conditions of development sites
- **Emergency Services**: Identify high-risk heat zones for resource allocation

---

## 📄 License

This project is part of the PCCE E-Cell Hackathon initiative.

---

## 🤝 Contributing

This is a hackathon project with collaborative development:

- **Jared**: Project lead, API integration, location detection
- **Team Members**: Handle HeatMap, Charts, and PDF export components

For issues or improvements, please coordinate with the team.

---

## 📞 Support

- Check `.env.local` is properly configured with OpenWeatherMap API key
- Ensure location detection fallback works (defaults to Mumbai)
- Historical data requires at least 1 data point (API provides 30-day history)
- Heat map requires client-side rendering (uses dynamic import with `ssr: false`)

---

**Last Updated**: May 14, 2026

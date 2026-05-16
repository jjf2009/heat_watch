import { NextResponse } from "next/server";
import { fetchCurrentWeather, fetchForecast, fetchTemp, fetchHourlyForecast } from "@/lib/weather";
import { fetchHistoricalWeather } from "@/lib/historical";
import { fetchNASAPowerData } from "@/lib/nasa";
import { calculateUHIScore } from "@/lib/mlScore";
import { linearRegression, forecastTemperatures } from "@/lib/regression";
import { generateRecommendations } from "@/lib/recommendations";
import { predictUHI } from "@/lib/onnxModel";
import { getEETiles } from "@/lib/earthEngine";
import { generateHeatZones } from "@/lib/heatZones";

const RURAL_OFFSETS = [
  { lat: 0.225, lng: 0 },
  { lat: -0.225, lng: 0 },
  { lat: 0, lng: 0.225 },
  { lat: 0, lng: -0.225 },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const city = searchParams.get("city") || "Searched Location";
  
  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "lat and lng parameters are required" }, { status: 400 });
  }

  const latNum = parseFloat(latStr);
  const lngNum = parseFloat(lngStr);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return NextResponse.json({ error: "lat and lng must be valid numbers" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY || "";

  try {
    // 1. Parallel fetching of base data
    const [weather, forecast, historical, nasaUrban, nasaRural, geeData] = await Promise.all([
      fetchCurrentWeather(latNum, lngNum, apiKey).catch(() => ({ temp: 30, humidity: 60, description: "Unknown", windSpeed: 0, feelsLike: 30, icon: "01d", cityName: city, countryCode: "XX" })),
      fetchForecast(latNum, lngNum, apiKey).catch(() => []),
      fetchHistoricalWeather(latNum, lngNum).catch(() => {
        // Fallback historical
        const fallback = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          fallback.push({
            date: date.toISOString().split('T')[0],
            temp: parseFloat((30 + (Math.random() * 4 - 2)).toFixed(1)),
            humidity: 60 + Math.round(Math.random() * 10 - 5)
          });
        }
        return fallback;
      }),
      fetchNASAPowerData(latNum, lngNum).catch(() => ({ lst: 35, ndvi_proxy: 0.4, longTermAvg: 30 })),
      fetchNASAPowerData(latNum + 0.15, lngNum + 0.15).catch(() => ({ lst: 33, ndvi_proxy: 0.6, longTermAvg: 29 })),
      getEETiles(latNum, lngNum).catch(() => null)
    ]);

    const urbanTemp = weather.temp || 30;

    // 2. Rural Baseline Calculation
    const ruralTemps = await Promise.all(
      RURAL_OFFSETS.map((offset) =>
        fetchTemp(latNum + offset.lat, lngNum + offset.lng, apiKey).catch(() => urbanTemp - 3)
      )
    );
    const ruralBaseline = parseFloat((ruralTemps.reduce((a, b) => a + b, 0) / ruralTemps.length).toFixed(2));
    const uhiIntensity = parseFloat((urbanTemp - ruralBaseline).toFixed(2));
    
    // 3. Adjusted UHI
    const vegetationDampening = nasaUrban.ndvi_proxy * 0.4 * 10;
    const adjustedUHI = Math.max(0, uhiIntensity - vegetationDampening * 0.1);

    // 4. ML Score Calculation
    const recentHumidity = historical[historical.length - 1]?.humidity || 60;
    const mlScore = calculateUHIScore({
      urbanTemp,
      ruralBaseline,
      humidity: recentHumidity,
      ndvi: nasaUrban.ndvi_proxy,
      historical: historical,
      meanLST: geeData?.meanLST,
      meanNDVI: geeData?.meanNDVI,
    });

    // 5. Regression Forecast
    const historicalTemps = historical.map((h: any) => h.temp);
    const { slope, r2 } = linearRegression(historicalTemps);
    const forecastedTemps = forecastTemperatures(historicalTemps, [1, 2, 3, 4, 5, 6, 7]);
    const forecastedUHI = forecastedTemps.map((t) => parseFloat((t - ruralBaseline + slope * 0.5).toFixed(2)));

    // 6. Hourly Pattern
    const hourlyPattern = await fetchHourlyForecast(latNum, lngNum, apiKey, ruralBaseline).catch(() => []);
    const peakHour = hourlyPattern.length > 0 ? hourlyPattern.reduce((max: any, h: any) => (h.uhiDelta > max.uhiDelta ? h : max), hourlyPattern[0]) : null;

    // 7. Advanced ML / AI
    const [recommendations, onnxPrediction] = await Promise.all([
      generateRecommendations(uhiIntensity, nasaUrban.ndvi_proxy, mlScore.riskLevel, city).catch(() => []),
      predictUHI(latNum, lngNum, uhiIntensity).catch(() => ({ historicalUHIBaseline: 1.5, projectedTrend: slope, anomaly: false }))
    ]);

    // 8. Heat Zones (for map)
    const heatZones = generateHeatZones(latNum, lngNum, mlScore.riskScore);

    // Assembly
    const payload = {
      location: { lat: latNum, lng: lngNum, city },
      weather,
      historical,
      forecast,
      heatZones,
      mlScore,
      uhiEngine: {
        urbanTemp,
        ruralBaseline,
        ruralTemps: ruralTemps.map((t, i) => ({
          direction: ["North", "South", "East", "West"][i],
          temp: t,
          lat: latNum + RURAL_OFFSETS[i].lat,
          lng: lngNum + RURAL_OFFSETS[i].lng,
        })),
        uhiIntensity,
        adjustedUHI,
        nasa: {
          lst: parseFloat(nasaUrban.lst.toFixed(1)),
          ndvi_proxy: parseFloat(nasaUrban.ndvi_proxy.toFixed(3)),
          longTermAvg: parseFloat(nasaUrban.longTermAvg.toFixed(1)),
          lstDelta: parseFloat((nasaUrban.lst - nasaRural.lst).toFixed(1)),
        },
        regression: {
          slope: parseFloat(slope.toFixed(4)),
          r2: parseFloat(r2.toFixed(3)),
          trend: slope > 0.05 ? "warming" : slope < -0.05 ? "cooling" : "stable",
        },
        forecast: forecastedTemps.map((temp, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i + 1);
          return {
            date: date.toISOString().split("T")[0],
            temp,
            uhiDelta: forecastedUHI[i],
          };
        }),
        hourlyPattern,
        peakHour,
        recommendations,
        onnxPrediction,
      },
      fetchedAt: new Date().toISOString()
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error("Master API error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate master payload" }, { status: 500 });
  }
}

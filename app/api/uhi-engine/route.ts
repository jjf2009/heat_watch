import { NextResponse } from "next/server";
import { fetchTemp, fetchHourlyForecast } from "@/lib/weather";
import { fetchNASAPowerData } from "@/lib/nasa";
import { fetchHistoricalWeather } from "@/lib/historical";
import { calculateUHIScore } from "@/lib/mlScore";
import { linearRegression, forecastTemperatures } from "@/lib/regression";
import { calculateIntervention } from "@/lib/intervention";
import { generateRecommendations } from "@/lib/recommendations";
import { predictUHI } from "@/lib/onnxModel";
import { getEETiles } from "@/lib/earthEngine";


const RURAL_OFFSETS = [
  { lat: 0.225, lng: 0 }, // North ~25km
  { lat: -0.225, lng: 0 }, // South ~25km
  { lat: 0, lng: 0.225 }, // East ~25km
  { lat: 0, lng: -0.225 }, // West ~25km
];

export async function POST(req: Request) {
  try {
    const { lat, lng, city, interventions } = await req.json();
    const apiKey = process.env.OPENWEATHER_API_KEY!;

    // === STEP 1: Fetch temperatures ===
    const urbanTemp = await fetchTemp(lat, lng, apiKey);
    const ruralTemps = await Promise.all(
      RURAL_OFFSETS.map((offset) =>
        fetchTemp(lat + offset.lat, lng + offset.lng, apiKey).catch(
          () => urbanTemp - 3,
        ),
      ),
    );
    const ruralBaseline = parseFloat(
      (ruralTemps.reduce((a, b) => a + b, 0) / ruralTemps.length).toFixed(2),
    );

    const uhiIntensity = parseFloat((urbanTemp - ruralBaseline).toFixed(2));

    // === STEP 2: NASA POWER data ===
    const [nasaUrban, nasaRural] = await Promise.all([
      fetchNASAPowerData(lat, lng),
      fetchNASAPowerData(lat + 0.15, lng + 0.15),
    ]);
    const vegetationDampening = nasaUrban.ndvi_proxy * 0.4 * 10;
    const adjustedUHI = Math.max(0, uhiIntensity - vegetationDampening * 0.1);

    // === STEP 3: Historical + Humidity ===
    const historicalData = await fetchHistoricalWeather(lat, lng);
    const recentHumidity = historicalData[historicalData.length - 1]?.humidity || 60;

    // === STEP 4: Satellite Data (GEE) ===
    // Fetch real-time MODIS values to improve accuracy
    const geeData = await getEETiles(lat, lng).catch(() => null);

    // === STEP 5: Composite Risk Score ===
    const mlScore = calculateUHIScore({
      urbanTemp,
      ruralBaseline,
      humidity: recentHumidity,
      ndvi: nasaUrban.ndvi_proxy,
      historical: historicalData,
      meanLST: geeData?.meanLST,
      meanNDVI: geeData?.meanNDVI,
    });

    // === STEP 5: Regression forecast ===
    const historicalTemps = historicalData.map(h => h.temp);
    const { slope, r2 } = linearRegression(historicalTemps);
    const forecastedTemps = forecastTemperatures(historicalTemps, [1, 2, 3, 4, 5, 6, 7]);
    const forecastedUHI = forecastedTemps.map((t) =>
      parseFloat((t - ruralBaseline + slope * 0.5).toFixed(2)),
    );

    // === STEP 6: Hourly pattern ===
    const hourlyPattern = await fetchHourlyForecast(lat, lng, apiKey, ruralBaseline);
    const peakHour = hourlyPattern.reduce(
      (max: any, h: any) => (h.uhiDelta > max.uhiDelta ? h : max),
      hourlyPattern[0],
    );

    // === STEP 7: Interventions, Recommendations & ONNX Model ===
    const interventionResult = interventions
      ? calculateIntervention(uhiIntensity, interventions)
      : null;

    const [recommendations, onnxPrediction] = await Promise.all([
      generateRecommendations(uhiIntensity, nasaUrban.ndvi_proxy, mlScore.riskLevel, city),
      predictUHI(lat, lng, uhiIntensity),
    ]);

    return NextResponse.json({
      urbanTemp,
      ruralBaseline,
      ruralTemps: ruralTemps.map((t, i) => ({
        direction: ["North", "South", "East", "West"][i],
        temp: t,
        lat: lat + RURAL_OFFSETS[i].lat,
        lng: lng + RURAL_OFFSETS[i].lng,
      })),
      uhiIntensity,
      adjustedUHI,
      nasa: {
        lst: parseFloat(nasaUrban.lst.toFixed(1)),
        ndvi_proxy: parseFloat(nasaUrban.ndvi_proxy.toFixed(3)),
        longTermAvg: parseFloat(nasaUrban.longTermAvg.toFixed(1)),
        lstDelta: parseFloat((nasaUrban.lst - nasaRural.lst).toFixed(1)),
      },
      riskScore: mlScore.riskScore,
      riskLevel: mlScore.riskLevel,
      mlScore,
      historical: historicalData,
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
      interventionResult,
      recommendations,
      onnxPrediction,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("UHI Engine error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { MLScore } from "./types";

export type MLScoreParams = {
  urbanTemp: number;
  ruralBaseline: number;
  humidity: number;
  ndvi: number;
  historical: { temp: number }[];
};

/**
 * Unified UHI Risk Scoring Model.
 * Replaces the old ml-score logic and uses real UHI delta and NDVI.
 */
export function calculateUHIScore({
  urbanTemp,
  ruralBaseline,
  humidity,
  ndvi,
  historical,
}: MLScoreParams): MLScore {
  // === REAL UHI DELTA ===
  const uhiIntensity = parseFloat((urbanTemp - ruralBaseline).toFixed(2));

  // === FACTOR 1: Thermal Anomaly / Direct UHI (40% weight) ===
  // We use the actual urban-rural delta, plus historical comparison
  const historicalMean =
    historical.length > 0
      ? historical.reduce((sum, h) => sum + Number(h.temp), 0) /
        historical.length
      : urbanTemp - 2;
  const temporalAnomaly = Math.max(0, urbanTemp - historicalMean);

  // Blend spatial delta (UHI) and temporal delta (hotter than usual)
  const thermalRiskValue = Math.max(0, uhiIntensity) + temporalAnomaly * 0.5;
  const thermalFactor = Math.min(100, (thermalRiskValue / 6) * 100);

  // === FACTOR 2: Humidity Heat Index (30% weight) ===
  const humidityFactor = Math.min(100, Math.max(0, ((humidity - 30) / 50) * 100));

  // === FACTOR 3: Urban Density / Vegetation Lack (30% weight) ===
  // We use the NDVI (Normalized Difference Vegetation Index)
  // Low NDVI (close to 0) means high urban density / low vegetation
  const urbanFactor = Math.min(100, (1 - ndvi) * 100);

  // === COMPOSITE UHI RISK SCORE ===
  const riskScore = Math.min(
    100,
    Math.round(
      thermalFactor * 0.4 + humidityFactor * 0.3 + urbanFactor * 0.3,
    ),
  );

  // === RISK CLASSIFICATION ===
  const riskLevel =
    riskScore >= 65 ? "High" : riskScore >= 35 ? "Medium" : "Low";

  // Recommendations will be provided by the recommendation engine
  return {
    riskScore,
    riskLevel: riskLevel as "High" | "Medium" | "Low",
    uhi_intensity: uhiIntensity,
    factors: {
      thermalFactor: Math.round(thermalFactor),
      humidityFactor: Math.round(humidityFactor),
      urbanFactor: Math.round(urbanFactor),
    },
    recommendations: [],
  };
}

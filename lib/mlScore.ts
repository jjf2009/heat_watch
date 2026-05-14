import { MLScore } from "./types";

export type MLScoreParams = {
  urbanTemp: number;
  ruralBaseline: number;
  humidity: number;
  ndvi: number; // ground proxy
  historical: { temp: number }[];
  meanLST?: number; // Real NASA LST
  meanNDVI?: number; // Real NASA NDVI
};

/**
 * UHI Composite Index calculation.
 * Combines satellite data, ground sensors, and climatology.
 */
export function calculateUHIScore({
  urbanTemp,
  ruralBaseline,
  humidity,
  ndvi,
  historical,
  meanLST,
  meanNDVI,
}: MLScoreParams): MLScore {
  // === REAL UHI DELTA ===
  const uhiIntensity = parseFloat((urbanTemp - ruralBaseline).toFixed(2));

  // === FACTOR 1: Thermal Index (40% weight) ===
  const historicalMean =
    historical.length > 0
      ? historical.reduce((sum, h) => sum + Number(h.temp), 0) /
        historical.length
      : urbanTemp - 2;
  
  // If we have real satellite LST, use it to boost confidence
  const directHeat = (meanLST && meanLST > 0) ? (urbanTemp + meanLST) / 2 : urbanTemp;
  const temporalAnomaly = Math.max(0, directHeat - historicalMean);

  const thermalRiskValue = Math.max(0, uhiIntensity) + temporalAnomaly * 0.5;
  const thermalFactor = Math.min(100, (thermalRiskValue / 6) * 100);

  // === FACTOR 2: Humidity Index (30% weight) ===
  const humidityFactor = Math.min(100, Math.max(0, ((humidity - 30) / 50) * 100));

  // === FACTOR 3: Urban Index (30% weight) ===
  // Use real satellite NDVI if available (it's much more accurate)
  const finalNDVI = (meanNDVI && meanNDVI > 0) ? meanNDVI : ndvi;
  const urbanFactor = Math.min(100, (1 - finalNDVI) * 100);

  // === COMPOSITE RISK SCORE ===
  const riskScore = Math.min(
    100,
    Math.round(
      thermalFactor * 0.4 + humidityFactor * 0.3 + urbanFactor * 0.3,
    ),
  );

  const riskLevel =
    riskScore >= 65 ? "High" : riskScore >= 35 ? "Medium" : "Low";

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

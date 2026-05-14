
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

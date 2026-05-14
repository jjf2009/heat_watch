// ─────────────────────────────────────────────────────────
//  ML PLACEHOLDER — predictHeatRisk.ts
//  TODO: Connect to actual ML model endpoint when ready.
//
//  Future integration will:
//  - Call a Python FastAPI / Vertex AI / HuggingFace endpoint
//  - Accept lat/lng + weather inputs
//  - Return a 0–100 heat risk score + confidence
// ─────────────────────────────────────────────────────────

export type PredictHeatRiskInput = {
  lat: number;
  lng: number;
  temp?: number;
  humidity?: number;
  timestamp?: string;
};

export type PredictHeatRiskOutput = {
  predictedRisk: number;      // 0–100
  confidence: number;          // 0–1
  label: "Low" | "Medium" | "High";
  source: "ml" | "mock";
};

/**
 * Predicts the heat risk for a given location.
 * Currently returns MOCKED values.
 * Replace the body with a real API call when the ML layer is ready.
 */
export async function predictHeatRisk(
  input: PredictHeatRiskInput
): Promise<PredictHeatRiskOutput> {
  // TODO: Replace with real ML API call
  // const res = await fetch(`${process.env.ML_API_URL}/predict`, {
  //   method: "POST",
  //   body: JSON.stringify(input),
  //   headers: { "Content-Type": "application/json" },
  // });
  // return res.json();

  // Mock: slightly randomised based on lat to look plausible
  const base = Math.abs(Math.sin(input.lat * 0.3)) * 80 + 10;
  const predictedRisk = Math.min(100, Math.round(base + Math.random() * 10));
  const label =
    predictedRisk > 65 ? "High" : predictedRisk > 35 ? "Medium" : "Low";

  return { predictedRisk, confidence: 0.72, label, source: "mock" };
}

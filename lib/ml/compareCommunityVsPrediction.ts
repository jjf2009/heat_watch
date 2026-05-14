// ─────────────────────────────────────────────────────────
//  ML PLACEHOLDER — compareCommunityVsPrediction.ts
//  TODO: Wire to real data pipeline when ML is integrated.
//
//  This module provides the "insight layer" that powers the
//  "Where science says hot vs where people feel hot" story.
// ─────────────────────────────────────────────────────────

export type ComparisonResult = {
  areaHash: string;
  mlRisk: number;               // 0–100 from ML
  communityRisk: number;        // 0–100 derived from citizen reports
  delta: number;                // positive = citizens feel hotter than ML predicts
  insight: string;              // human-readable interpretation
  layer: "agreement" | "community_higher" | "ml_higher" | "insufficient_data";
};

/**
 * Produces a human-readable comparison between ML prediction and citizen perception.
 * Currently uses mock data. Replace with DB aggregation + ML API call.
 */
export async function compareCommunityVsPrediction(
  areaHash: string,
  mlRisk: number,
  communityReports: Array<{ heatLevel: number }>
): Promise<ComparisonResult> {
  if (communityReports.length < 3) {
    return {
      areaHash,
      mlRisk,
      communityRisk: 0,
      delta: 0,
      insight: "Not enough community reports to compare with model predictions.",
      layer: "insufficient_data",
    };
  }

  const avgCitizen =
    communityReports.reduce((s, r) => s + r.heatLevel, 0) /
    communityReports.length;
  const communityRisk = Math.round(((avgCitizen - 1) / 4) * 100);
  const delta = communityRisk - mlRisk;

  let layer: ComparisonResult["layer"];
  let insight: string;

  if (Math.abs(delta) <= 10) {
    layer = "agreement";
    insight = "Community perception closely matches model predictions — high confidence area.";
  } else if (delta > 10) {
    layer = "community_higher";
    insight = `Citizens feel ${delta} points hotter than the model predicts. Possible microclimate factors (asphalt density, lack of green cover).`;
  } else {
    layer = "ml_higher";
    insight = `The model predicts higher risk than citizens report. Could indicate recent green-cover additions or reporting gap.`;
  }

  return { areaHash, mlRisk, communityRisk, delta, insight, layer };
}

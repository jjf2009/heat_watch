// ─────────────────────────────────────────────────────────
//  ML PLACEHOLDER — calibrationService.ts
//  TODO: Implement weak-supervision feedback loop.
//
//  Future integration will:
//  - Aggregate community reports per geohash cell
//  - Compare with ML predicted values
//  - Nudge model weights via fine-tuning or re-weighting
// ─────────────────────────────────────────────────────────

export type CalibrationInput = {
  areaHash: string;
  communityReports: Array<{
    heatLevel: number;   // 1–5 citizen score
    deviceTemp?: number;
  }>;
  mlPredictedRisk: number; // 0–100
};

export type CalibrationOutput = {
  calibratedRisk: number;        // 0–100, community-adjusted
  communityWeight: number;       // 0–1, how much community shifted the score
  reportCount: number;
};

/**
 * Calibrates ML prediction using crowdsourced heat reports.
 * Currently returns mocked blended values.
 */
export async function calibrateWithCommunity(
  input: CalibrationInput
): Promise<CalibrationOutput> {
  // TODO: implement proper Bayesian update or weighted average with confidence intervals
  const { communityReports, mlPredictedRisk } = input;

  if (communityReports.length === 0) {
    return {
      calibratedRisk: mlPredictedRisk,
      communityWeight: 0,
      reportCount: 0,
    };
  }

  const avgCitizenScore =
    communityReports.reduce((sum, r) => sum + r.heatLevel, 0) /
    communityReports.length;

  // Scale citizen 1–5 to 0–100
  const citizenRisk = ((avgCitizenScore - 1) / 4) * 100;

  // Blend: more community reports → more weight
  const communityWeight = Math.min(0.6, communityReports.length * 0.05);
  const calibratedRisk = Math.round(
    mlPredictedRisk * (1 - communityWeight) + citizenRisk * communityWeight
  );

  return { calibratedRisk, communityWeight, reportCount: communityReports.length };
}

// ─────────────────────────────────────────────────────────
//  Community Heat Reporting — shared types
// ─────────────────────────────────────────────────────────

export type ShadeLevel = "none" | "partial" | "good";

export type HeatReport = {
  id: string;
  lat: number;
  lng: number;
  heatLevel: number;        // 1–5 user slider
  shadeLevel: ShadeLevel;
  comment?: string;
  deviceTemp?: number;      // optional °C reading from user device
  createdAt: string;        // ISO timestamp
  areaHash: string;         // geohash for rate-limiting & clustering
  hashedUser: string;       // hashed IP / fingerprint (privacy-safe)
};

/** Payload the client sends to the API */
export type CreateReportPayload = Omit<HeatReport, "id" | "createdAt" | "hashedUser">;

/** Lightweight marker shape returned to the community map */
export type ReportMarker = {
  id: string;
  lat: number;
  lng: number;
  heatLevel: number;
  shadeLevel: ShadeLevel;
  createdAt: string;
};

// ── Future ML integration interface ───────────────────────
/** When the ML layer is connected it will extend each report with these fields */
export type MLEnrichedReport = HeatReport & {
  mlPredictedRisk?: number;         // 0–100 predicted heat risk
  calibrationDelta?: number;        // citizen-perceived minus ML-predicted
  mlConfidence?: number;            // 0–1
};

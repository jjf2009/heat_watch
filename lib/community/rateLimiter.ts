// ─────────────────────────────────────────────────────────
//  Client-side rate limiter (localStorage fallback)
//  Server-side validation also re-checks this logic
//  using the hashed IP stored in the report record.
// ─────────────────────────────────────────────────────────

import { buildAreaKey } from "./geoHash";

const LS_PREFIX = "hw_report_";
const WINDOW_MINUTES = 30;

/**
 * Returns true when the user has already submitted a report
 * for this geo-area within the current time window.
 */
export function isRateLimited(lat: number, lng: number): boolean {
  if (typeof window === "undefined") return false;
  const key = LS_PREFIX + buildAreaKey(lat, lng, WINDOW_MINUTES);
  return localStorage.getItem(key) !== null;
}

/**
 * Record a submission in localStorage so subsequent calls
 * to isRateLimited() return true for the cooldown window.
 */
export function recordSubmission(lat: number, lng: number): void {
  if (typeof window === "undefined") return;
  const key = LS_PREFIX + buildAreaKey(lat, lng, WINDOW_MINUTES);
  localStorage.setItem(key, Date.now().toString());
}

/**
 * Simple browser fingerprint: combines several stable signals
 * into a short hash-like string.  Not cryptographically strong —
 * just enough to detect duplicate submissions from the same device.
 */
export function getBrowserFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  // djb2 hash
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

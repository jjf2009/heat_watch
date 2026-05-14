// ─────────────────────────────────────────────────────────
//  Lightweight geohash — no external dependency
//  Encodes lat/lng into a fixed-precision grid string
//  used for rate-limiting (1 report per area per window)
// ─────────────────────────────────────────────────────────

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/**
 * Encode a lat/lng pair to a geohash of given precision.
 * Precision 5 ≈ 4.9 km × 4.9 km cell (good for neighbourhood-level grouping).
 */
export function encodeGeoHash(lat: number, lng: number, precision = 5): string {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = "";

  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const lngMid = (lngMin + lngMax) / 2;
      if (lng >= lngMid) { idx = idx * 2 + 1; lngMin = lngMid; }
      else               { idx = idx * 2;     lngMax = lngMid; }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) { idx = idx * 2 + 1; latMin = latMid; }
      else               { idx = idx * 2;     latMax = latMid; }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

/**
 * Build a compound area key: geohash + coarse time bucket.
 * Used as the localStorage / server-side rate-limit key.
 * windowMinutes: size of the cooldown window (default 30 min).
 */
export function buildAreaKey(lat: number, lng: number, windowMinutes = 30): string {
  const hash = encodeGeoHash(lat, lng, 5);
  const bucket = Math.floor(Date.now() / (windowMinutes * 60 * 1000));
  return `${hash}:${bucket}`;
}

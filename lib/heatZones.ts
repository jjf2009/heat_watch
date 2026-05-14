import { HeatZone } from "./types";

/**
 * Generate randomized heat zones around a center point, scaled by risk score.
 */
export function generateHeatZones(
  lat: number,
  lng: number,
  riskScore: number,
): HeatZone[] {
  const zones: HeatZone[] = [];
  const count = 40;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 0.08;
    zones.push({
      lat: lat + radius * Math.sin(angle),
      lng: lng + radius * Math.cos(angle),
      intensity: (riskScore / 100) * (0.5 + Math.random() * 0.5),
    });
  }
  // center point always hottest
  zones.push({ lat, lng, intensity: riskScore / 100 });
  return zones;
}

/**
 * Generate mock GeoJSON polygons for map data.
 */
export function generateGeoJSON(lat: number, lng: number): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: Array.from({ length: 5 }).map(() => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng + Math.random() * 0.1, lat + Math.random() * 0.1],
            [lng + Math.random() * 0.1, lat - Math.random() * 0.1],
            [lng - Math.random() * 0.1, lat - Math.random() * 0.1],
            [lng - Math.random() * 0.1, lat + Math.random() * 0.1],
            [lng + Math.random() * 0.1, lat + Math.random() * 0.1],
          ],
        ],
      },
      properties: {
        intensity: Math.random() * 10,
        temperature: 25 + Math.random() * 15,
      },
    })),
  };
}

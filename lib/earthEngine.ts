import path from "path";
import fs from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

export type EETileData = {
  lstTileUrl: string;   // MODIS Land Surface Temperature heat raster
  ndviTileUrl: string;  // NDVI vegetation density raster
  lstMin: number;
  lstMax: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let ee: any = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

function loadEE() {
  if (!ee) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ee = require("@google/earthengine");
  }
  return ee;
}

async function initEE(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve, reject) => {
    const earthengine = loadEE();
    const keyPath = path.join(process.cwd(), "gee-key.json");
    const privateKey = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

    earthengine.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        earthengine.initialize(
          null,
          null,
          () => {
            initialized = true;
            resolve();
          },
          (err: Error) => reject(err),
        );
      },
      (err: Error) => reject(err),
    );
  });

  return initPromise;
}

function getMapId(image: any, visParams: any): Promise<{ urlFormat: string }> {
  return new Promise((resolve, reject) => {
    image.getMap(visParams, (result: any, err: any) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Fetches real-time LST and NDVI tile URLs from Google Earth Engine.
 * LST source:  MODIS/061/MOD11A1  (Terra Land Surface Temperature, daily)
 * NDVI source: MODIS/061/MOD13A1  (Terra NDVI, 16-day composite)
 */
export async function getEETiles(lat: number, lng: number): Promise<EETileData> {
  await initEE();
  const earthengine = loadEE();

  // Date range — last 30 days
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 30);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  // Region of interest: ~30km buffer around the city
  const point = earthengine.Geometry.Point([lng, lat]);
  const region = point.buffer(30000); // 30 km radius

  // --- LST ---
  const lstCollection = earthengine
    .ImageCollection("MODIS/061/MOD11A1")
    .filterDate(startStr, endStr)
    .select("LST_Day_1km")
    .filterBounds(region);

  const lstImage = lstCollection
    .median()
    .multiply(0.02) // Scale factor: convert to Kelvin
    .subtract(273.15); // Convert to Celsius

  // Clip to region for tighter tiles
  const lstClipped = lstImage.clip(region);

  // Dynamic min/max based on season (tropical default 25–50°C)
  const lstMin = 25;
  const lstMax = 55;

  const lstVisParams = {
    min: lstMin,
    max: lstMax,
    palette: ["#313695", "#74add1", "#fed976", "#fd8d3c", "#f03b20", "#bd0026"],
  };

  // --- NDVI ---
  const ndviCollection = earthengine
    .ImageCollection("MODIS/061/MOD13A1")
    .filterDate(startStr, endStr)
    .select("NDVI")
    .filterBounds(region);

  const ndviImage = ndviCollection
    .median()
    .multiply(0.0001) // Scale factor
    .clip(region);

  const ndviVisParams = {
    min: 0,
    max: 0.8,
    palette: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
  };

  // Fetch tile URLs in parallel
  const [lstMap, ndviMap] = await Promise.all([
    getMapId(lstClipped, lstVisParams),
    getMapId(ndviImage, ndviVisParams),
  ]);

  return {
    lstTileUrl: lstMap.urlFormat,
    ndviTileUrl: ndviMap.urlFormat,
    lstMin,
    lstMax,
  };
}

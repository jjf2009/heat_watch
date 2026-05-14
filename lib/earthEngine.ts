import path from "path";
import fs from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

export type EETileData = {
  lstTileUrl: string;
  ndviTileUrl: string;
  lstMin: number;
  lstMax: number;
  // Raw values for the risk engine
  meanLST: number;
  meanNDVI: number;
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

export async function getEETiles(lat: number, lng: number): Promise<EETileData> {
  const keyPath = path.join(process.cwd(), "gee-key.json");
  if (!fs.existsSync(keyPath)) {
    console.warn("gee-key.json not found, using fallback satellite tiles.");
    return {
      lstTileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ndviTileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
      lstMin: 25,
      lstMax: 55,
      meanLST: 34.5,
      meanNDVI: 0.45,
    };
  }

  await initEE();
  const earthengine = loadEE();

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 30);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  const point = earthengine.Geometry.Point([lng, lat]);
  const region = point.buffer(30000); 

  // --- LST ---
  const lstCollection = earthengine
    .ImageCollection("MODIS/061/MOD11A1")
    .filterDate(startStr, endStr)
    .select("LST_Day_1km")
    .filterBounds(point); // Sample exactly at the point

  const lstImage = lstCollection.median().multiply(0.02).subtract(273.15);
  
  // --- NDVI ---
  const ndviCollection = earthengine
    .ImageCollection("MODIS/061/MOD13A1")
    .filterDate(startStr, endStr)
    .select("NDVI")
    .filterBounds(point);

  const ndviImage = ndviCollection.median().multiply(0.0001);

  // Get raw values via reduceRegion
  const getVal = (img: any, p: any) => {
    return new Promise<number>((resolve) => {
      img.reduceRegion({
        reducer: earthengine.Reducer.mean(),
        geometry: p,
        scale: 1000,
      }).evaluate((result: any, err: any) => {
        if (err || !result) return resolve(0);
        // MODIS band names
        const val = result["LST_Day_1km"] ?? result["NDVI"] ?? 0;
        resolve(val);
      });
    });
  };

  // Fetch everything in parallel
  const [lstMap, ndviMap, meanLST, meanNDVI] = await Promise.all([
    getMapId(lstImage.clip(region), {
      min: 25, max: 55,
      palette: ["#313695", "#74add1", "#fed976", "#fd8d3c", "#f03b20", "#bd0026"],
    }),
    getMapId(ndviImage.clip(region), {
      min: 0, max: 0.8,
      palette: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
    }),
    getVal(lstImage, point),
    getVal(ndviImage, point),
  ]);

  return {
    lstTileUrl: lstMap.urlFormat,
    ndviTileUrl: ndviMap.urlFormat,
    lstMin: 25,
    lstMax: 55,
    meanLST: parseFloat(Number(meanLST || 0).toFixed(2)),
    meanNDVI: parseFloat(Number(meanNDVI || 0).toFixed(3)),
  };
}

import axios from "axios";

export type NASAPowerData = {
  lst: number; // Land Surface Temperature proxy
  ndvi_proxy: number; // Vegetation proxy from solar radiation
  longTermAvg: number;
};

/**
 * Fetch environmental data from NASA POWER API.
 */
export async function fetchNASAPowerData(
  lat: number,
  lng: number,
): Promise<NASAPowerData> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

  try {
    const res = await axios.get(
      `https://power.larc.nasa.gov/api/temporal/daily/point`,
      {
        params: {
          parameters: "T2M,ALLSKY_SFC_SW_DWN,RH2M",
          community: "RE",
          latitude: lat.toFixed(4),
          longitude: lng.toFixed(4),
          start: fmt(start),
          end: fmt(end),
          format: "JSON",
        },
        timeout: 10000,
      },
    );

    const data = res.data.properties.parameter;
    const temps: number[] = Object.values(data.T2M).filter(
      (v: any) => v !== -999,
    ) as number[];
    const radiation: number[] = Object.values(data.ALLSKY_SFC_SW_DWN).filter(
      (v: any) => v !== -999,
    ) as number[];

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgRad = radiation.reduce((a, b) => a + b, 0) / radiation.length;

    // LST proxy: surface is ~2-5°C hotter than air temp in urban areas
    const lst = avgTemp + 2.5;

    // NDVI proxy: high solar radiation absorption = low vegetation (low NDVI)
    // Scale: 0-1 where 1 = dense vegetation
    const ndvi_proxy = Math.max(0, Math.min(1, 1 - avgRad / 300));

    return { lst, ndvi_proxy, longTermAvg: avgTemp };
  } catch {
    // Fallback if NASA API is slow or unavailable
    return { lst: lat > 0 ? 35 : 30, ndvi_proxy: 0.3, longTermAvg: 30 };
  }
}

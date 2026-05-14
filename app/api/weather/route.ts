import { NextResponse } from "next/server";
import { fetchCurrentWeather, fetchForecast } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const apiKey = process.env.OPENWEATHER_API_KEY;

  console.log("[API Weather] Request received:", { lat: latStr, lng: lngStr, hasApiKey: !!apiKey });

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "lat and lng parameters are required" }, { status: 400 });
  }

  const latNum = parseFloat(latStr);
  const lngNum = parseFloat(lngStr);

  if (isNaN(latNum) || isNaN(lngNum)) {
    console.error("[API Weather] Parsed coordinates are NaN!", { latStr, lngStr });
    return NextResponse.json({ error: "lat and lng must be valid numbers" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "OpenWeather API key missing on server (.env.local)" }, { status: 500 });
  }

  try {
    const [weather, forecast] = await Promise.all([
      fetchCurrentWeather(latNum, lngNum, apiKey),
      fetchForecast(latNum, lngNum, apiKey),
    ]);

    return NextResponse.json({ weather, forecast });
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data;
    console.error(`[API Weather] OpenWeatherMap API failed with status ${status}:`, data || err.message);
    
    return NextResponse.json(
      { 
        error: `Failed to fetch weather: ${data?.message || err.message}`, 
        details: data 
      },
      { status: 500 }
    );
  }
}
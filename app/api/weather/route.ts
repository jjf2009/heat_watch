import { NextResponse } from "next/server";
import { fetchCurrentWeather, fetchForecast } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const apiKey = process.env.OPENWEATHER_API_KEY || "";

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

  try {
    // Using the resilient library helpers which automatically fall back to 
    // climate-aware simulated data if the API key is missing, invalid, or throttled.
    const [weather, forecast] = await Promise.all([
      fetchCurrentWeather(latNum, lngNum, apiKey),
      fetchForecast(latNum, lngNum, apiKey),
    ]);

    return NextResponse.json({ weather, forecast });
  } catch (err: any) {
    // This catch is just a super safe backstop.
    console.error(`[API Weather] Unexpected failure:`, err.message);
    return NextResponse.json(
      { error: `Resilient weather pipeline failed: ${err.message}` },
      { status: 500 }
    );
  }
}
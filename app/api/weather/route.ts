import { NextResponse } from "next/server";
import { fetchCurrentWeather, fetchForecast } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "OpenWeather API key missing" }, { status: 500 });
  }

  try {
    const [weather, forecast] = await Promise.all([
      fetchCurrentWeather(parseFloat(lat), parseFloat(lng), apiKey),
      fetchForecast(parseFloat(lat), parseFloat(lng), apiKey),
    ]);

    return NextResponse.json({ weather, forecast });
  } catch (err: any) {
    console.error("Failed to fetch weather", err);
    return NextResponse.json(
      { error: "Failed to fetch weather", details: err?.response?.data || err.message },
      { status: 500 }
    );
  }
}
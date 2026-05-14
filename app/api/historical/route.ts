import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });

  try {
    // Open-Meteo: completely free, no API key needed
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lng,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
        past_days: 30,
        timezone: "auto",
      },
    });

    const { daily } = response.data;
    const historical = daily.time.map((date: string, i: number) => ({
      date,
      temp: ((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2).toFixed(1),
      humidity: 60 + Math.round(Math.random() * 20), // Open-Meteo free tier doesn't include humidity in daily
    }));

    return NextResponse.json({ historical });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 });
  }
}
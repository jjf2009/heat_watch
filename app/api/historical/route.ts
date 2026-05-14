import { NextResponse } from "next/server";
import { fetchHistoricalWeather } from "@/lib/historical";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  try {
    const historical = await fetchHistoricalWeather(parseFloat(lat), parseFloat(lng));
    return NextResponse.json({ historical });
  } catch (err: any) {
    console.error("Failed to fetch historical data", err);
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 });
  }
}

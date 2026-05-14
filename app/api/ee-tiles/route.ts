import { NextResponse } from "next/server";
import { getEETiles } from "@/lib/earthEngine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "0");
    const lng = parseFloat(searchParams.get("lng") ?? "0");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    const tiles = await getEETiles(lat, lng);
    return NextResponse.json(tiles);
  } catch (err: any) {
    console.error("Earth Engine tile fetch failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

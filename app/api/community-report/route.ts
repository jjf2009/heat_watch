import { NextResponse } from "next/server";

export type HeatReport = {
  id: string;
  lat: number;
  lng: number;
  heatLevel: number;       // 1–5
  shadeLevel: number;      // 1–5
  comment: string;
  timestamp: string;
  city: string;
};

// In-memory store (resets on server restart — swap for Supabase later)
const reports: HeatReport[] = [];

// ─── GET /api/community-report?lat=&lng=&radius= ─────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");
  const radius = parseFloat(searchParams.get("radius") ?? "50"); // km

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  // Filter reports within radius (Haversine approximation)
  const nearby = reports.filter((r) => {
    const dlat = (r.lat - lat) * (Math.PI / 180);
    const dlng = (r.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dlat / 2) ** 2 +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(r.lat * (Math.PI / 180)) *
        Math.sin(dlng / 2) ** 2;
    const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return distKm <= radius;
  });

  // Return most recent 200 reports
  const sorted = [...nearby].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return NextResponse.json({ reports: sorted.slice(0, 200) });
}

// ─── POST /api/community-report ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lng, heatLevel, shadeLevel, comment, city } = body;

    if (!lat || !lng || !heatLevel || !shadeLevel) {
      return NextResponse.json(
        { error: "lat, lng, heatLevel, shadeLevel required" },
        { status: 400 }
      );
    }

    if (heatLevel < 1 || heatLevel > 5 || shadeLevel < 1 || shadeLevel > 5) {
      return NextResponse.json(
        { error: "heatLevel and shadeLevel must be between 1–5" },
        { status: 400 }
      );
    }

    const report: HeatReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      heatLevel,
      shadeLevel,
      comment: String(comment ?? "").slice(0, 300),
      timestamp: new Date().toISOString(),
      city: String(city ?? "Unknown"),
    };

    reports.push(report);

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

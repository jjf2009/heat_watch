import { NextRequest, NextResponse } from "next/server";
import { CreateReportSchema } from "@/lib/community/validation";
import { buildAreaKey } from "@/lib/community/geoHash";
import type { HeatReport, ReportMarker } from "@/lib/community/types";

// ─────────────────────────────────────────────────────────
//  In-memory store (replace with Supabase / Firebase when ready)
//  TODO: swap `reports` array for a real DB client:
//
//  import { createClient } from "@supabase/supabase-js";
//  const supabase = createClient(
//    process.env.NEXT_PUBLIC_SUPABASE_URL!,
//    process.env.SUPABASE_SERVICE_KEY!
//  );
// ─────────────────────────────────────────────────────────
const reports: HeatReport[] = [];

// Server-side rate-limit store: key → timestamp
const rateLimitMap = new Map<string, number>();
const WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

// ── POST /api/community-report ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateReportSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Zod parse error:", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid report data", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Server-side rate-limit check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rateLimitKey = `${simpleHash(ip)}:${buildAreaKey(data.lat, data.lng)}`;
    const lastSubmit = rateLimitMap.get(rateLimitKey);

    if (lastSubmit && Date.now() - lastSubmit < WINDOW_MS) {
      return NextResponse.json(
        { error: "Report already submitted recently for this area." },
        { status: 429 }
      );
    }

    const report: HeatReport = {
      id: crypto.randomUUID(),
      lat: data.lat,
      lng: data.lng,
      heatLevel: data.heatLevel,
      shadeLevel: data.shadeLevel,
      comment: data.comment,
      deviceTemp: data.deviceTemp,
      areaHash: data.areaHash,
      hashedUser: data.hashedUser,
      createdAt: new Date().toISOString(),
    };

    // TODO: Replace with: await supabase.from("heat_reports").insert(report)
    reports.push(report);
    rateLimitMap.set(rateLimitKey, Date.now());

    return NextResponse.json({ success: true, id: report.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── GET /api/community-report ──────────────────────────────
// Returns lightweight markers for the map layer
export async function GET() {
  // TODO: Replace with: const { data } = await supabase.from("heat_reports").select("id,lat,lng,heatLevel,shadeLevel,createdAt")
  const markers: ReportMarker[] = reports.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    heatLevel: r.heatLevel,
    shadeLevel: r.shadeLevel,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ markers }, { status: 200 });
}

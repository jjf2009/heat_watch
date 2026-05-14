import { NextResponse } from "next/server";
import { generateGeoJSON } from "@/lib/heatZones";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "15.49");
  const lng = parseFloat(searchParams.get("lng") || "73.82");

  const mockGeoJson = generateGeoJSON(lat, lng);

  return NextResponse.json(mockGeoJson, { headers: corsHeaders });
}

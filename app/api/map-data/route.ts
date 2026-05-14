import { NextResponse } from "next/server";

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

  // Generate some mock GeoJSON data for the heat map
  const mockGeoJson = {
    type: "FeatureCollection",
    features: Array.from({ length: 5 }).map((_, i) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng + Math.random() * 0.1, lat + Math.random() * 0.1],
            [lng + Math.random() * 0.1, lat - Math.random() * 0.1],
            [lng - Math.random() * 0.1, lat - Math.random() * 0.1],
            [lng - Math.random() * 0.1, lat + Math.random() * 0.1],
            [lng + Math.random() * 0.1, lat + Math.random() * 0.1],
          ],
        ],
      },
      properties: {
        intensity: Math.random() * 10,
        temperature: 25 + Math.random() * 15,
      },
    })),
  };

  return NextResponse.json(mockGeoJson, { headers: corsHeaders });
}

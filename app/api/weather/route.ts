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
  const city = searchParams.get("city") || "Sample City";

  // Mock live weather data
  const data = {
    location: city,
    temperature: Number((28 + Math.random() * 10).toFixed(1)),
    humidity: Math.floor(50 + Math.random() * 40),
    windSpeed: Number((Math.random() * 20).toFixed(1)),
    conditions: "Sunny",
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(data, { headers: corsHeaders });
}

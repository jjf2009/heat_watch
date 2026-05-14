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

export async function GET() {
  const data = [
    { timestamp: new Date().toISOString(), value: Number((20 + Math.random() * 5).toFixed(1)) },
    { timestamp: new Date(Date.now() - 3600_000).toISOString(), value: Number((21 + Math.random() * 5).toFixed(1)) },
    { timestamp: new Date(Date.now() - 7200_000).toISOString(), value: Number((22 + Math.random() * 5).toFixed(1)) },
  ];
  return NextResponse.json(data, { headers: corsHeaders });
}

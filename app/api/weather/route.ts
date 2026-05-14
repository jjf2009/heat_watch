import { NextResponse } from "next/server";

export async function GET() {
  const sample = { temperature: 22.5, humidity: 60, location: "Sample City" };
  return NextResponse.json(sample);
}

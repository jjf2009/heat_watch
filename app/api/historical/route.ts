import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    { timestamp: new Date().toISOString(), value: 20 },
    { timestamp: new Date(Date.now() - 3600_000).toISOString(), value: 21 },
  ];
  return NextResponse.json(data);
}

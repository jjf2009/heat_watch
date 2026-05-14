import { NextResponse } from "next/server";

export async function GET() {
  const resp = { score: 0.82, label: "safe" };
  return NextResponse.json(resp);
}

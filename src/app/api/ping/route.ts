import { NextResponse } from "next/server";

export async function GET() {
  // Lightweight same-origin health check used by the client connectivity probe.
  return new NextResponse(null, { status: 204 });
}

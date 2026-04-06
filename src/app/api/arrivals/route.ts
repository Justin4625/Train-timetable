import { NextResponse } from "next/server";
import { getArrivals } from "@/lib/ns-api";

export const dynamic = "force-static";

export async function GET() {
  try {
    // Keep this route static-export friendly by using a fixed station.
    const data = await getArrivals("RTD");
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch arrivals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

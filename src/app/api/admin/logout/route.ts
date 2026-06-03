import { NextResponse } from "next/server";
import { terminateSession } from "@/lib/auth";

export async function POST() {
  try {
    await terminateSession();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Logout API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

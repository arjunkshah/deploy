import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import * as jobs from "@/lib/jobs";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const heartbeat = await jobs.getWorkerHeartbeat();
  const online = await jobs.isWorkerOnline();

  return NextResponse.json({
    online,
    status: heartbeat?.status ?? "unknown",
    lastSeen: heartbeat?.lastSeen ? heartbeat.lastSeen.toISOString() : null
  });
}

export const runtime = "nodejs";

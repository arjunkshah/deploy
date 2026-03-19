import { NextResponse } from "next/server";

import * as db from "@/lib/db";
import * as vercel from "@/lib/vercel";

export async function POST() {
  try {
    const expired = await db.getExpiredDeployments();
    for (const deployment of expired) {
      if (deployment.projectId) {
        try {
          await vercel.deleteProject(deployment.projectId);
        } catch (err) {
          console.warn("Failed to delete Vercel project", err);
        }
      }
    }
    await db.purgeExpired();
    return NextResponse.json({ removed: expired.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

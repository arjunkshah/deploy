import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import * as db from "@/lib/db";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const deployments = await db.listRecentDeployments(10, session.user?.email ?? null);
    const payload = deployments.map((deployment) => ({
      id: deployment.id,
      repo: deployment.repo,
      url: deployment.url ?? null,
      status: deployment.status,
      createdAt: deployment.createdAt?.toISOString?.() ?? new Date().toISOString()
    }));
    return NextResponse.json({ deployments: payload });
  } catch (error) {
    console.error("Failed to load deployments", error);
    return NextResponse.json({ deployments: [] });
  }
}

export const runtime = "nodejs";

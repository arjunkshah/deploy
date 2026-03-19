import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import * as db from "@/lib/db";

const domainSchema = z
  .string()
  .trim()
  .min(3)
  .max(253)
  .regex(/^[a-z0-9.-]+$/i, "Invalid domain")
  .refine((value) => !value.includes(".."), "Invalid domain")
  .transform((value) => value.toLowerCase());

function normalizeDomain(input: string) {
  const trimmed = input.trim();
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  return withoutProtocol.split("/")[0] ?? "";
}

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");
  if (!repo) {
    return NextResponse.json({ error: "Missing repo" }, { status: 400 });
  }

  const domains = await db.listDomains(repo);
  return NextResponse.json({ domains });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const repo = typeof body.repo === "string" ? body.repo : "";
  const rawDomain = typeof body.domain === "string" ? body.domain : "";

  if (!repo) {
    return NextResponse.json({ error: "Missing repo" }, { status: 400 });
  }

  const normalized = normalizeDomain(rawDomain);
  const parsed = domainSchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await db.addDomain({ id, repo, domain: parsed.data });
  return NextResponse.json({ id, domain: parsed.data });
}

export async function DELETE(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const repo = typeof body.repo === "string" ? body.repo : "";
  const rawDomain = typeof body.domain === "string" ? body.domain : "";

  if (!repo) {
    return NextResponse.json({ error: "Missing repo" }, { status: 400 });
  }

  const normalized = normalizeDomain(rawDomain);
  const parsed = domainSchema.safeParse(normalized);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  await db.removeDomain({ repo, domain: parsed.data });
  return NextResponse.json({ ok: true });
}

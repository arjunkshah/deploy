import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export const runtime = "nodejs";

function ensureNextAuthUrl(request: NextRequest) {
  if (process.env.NEXTAUTH_URL) return;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  process.env.NEXTAUTH_URL = `${proto}://${host}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  ensureNextAuthUrl(request);
  const params = await context.params;
  return handler(request, { params: { nextauth: params.nextauth ?? [] } });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  ensureNextAuthUrl(request);
  const params = await context.params;
  return handler(request, { params: { nextauth: params.nextauth ?? [] } });
}

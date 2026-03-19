import { NextResponse } from "next/server";
import { z } from "zod";

import { createUser } from "@/lib/users";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);
    await createUser(parsed.email.toLowerCase(), parsed.password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account";
    if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const runtime = "nodejs";

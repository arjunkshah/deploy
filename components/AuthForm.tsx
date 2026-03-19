"use client";

import type { Route } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MagneticButton } from "@/components/MagneticButton";

export function AuthForm({ mode, returnTo }: { mode: "login" | "signup"; returnTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Unable to create account");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: returnTo ?? "/dashboard"
      });

      if (!result?.ok) {
        throw new Error(result?.error ?? "Invalid email or password");
      }

      router.push((returnTo ?? "/dashboard") as Route);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${mode}-email`}>
          Email
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${mode}-password`}>
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/50"
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <MagneticButton
        type="button"
        onClick={handleSubmit}
        disabled={loading || !email || !password}
        className="w-full rounded-full bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
      </MagneticButton>
    </div>
  );
}

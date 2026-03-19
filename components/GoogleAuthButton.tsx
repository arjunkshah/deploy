"use client";

import { signIn } from "next-auth/react";

import { cn } from "@/lib/utils";

export function GoogleAuthButton({
  returnTo,
  label,
  disabled,
  className
}: {
  returnTo?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const handleClick = () => {
    if (disabled) return;
    void signIn("google", { callbackUrl: returnTo ?? "/dashboard" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center rounded-full border border-border/80 bg-background px-5 py-3 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40 disabled:opacity-50",
        className
      )}
    >
      {label ?? "Continue with Google"}
    </button>
  );
}

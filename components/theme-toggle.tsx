"use client";

import { MoonStars, SunDim } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted] = useState(() => typeof window !== "undefined");

  if (!mounted) return null;

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2 rounded-full px-3"
    >
      {isDark ? <SunDim size={18} /> : <MoonStars size={18} />}
      <span className="text-xs">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}

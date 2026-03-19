"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function HeroUrlSwap({
  primary,
  secondary,
  suffix
}: {
  primary: string;
  secondary: string;
  suffix: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative w-full" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
      <div className="relative flex items-center overflow-hidden rounded-2xl border border-border/70 bg-card px-5 py-4 text-left text-base font-mono tracking-tight text-muted-foreground shadow-[0_18px_40px_-34px_rgba(15,23,42,0.25)] md:text-lg">
        <span className="mr-1 text-muted-foreground">https://</span>
        <span className="relative inline-block h-[1.2em] min-w-[190px] overflow-hidden">
          <AnimatePresence mode="popLayout">
            {!hovered ? (
              <motion.span
                key="primary"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 text-foreground"
              >
                {primary}
              </motion.span>
            ) : (
              <motion.span
                key="secondary"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 font-semibold text-primary"
              >
                {secondary}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="ml-1 text-foreground">{suffix}</span>
      </div>
    </div>
  );
}

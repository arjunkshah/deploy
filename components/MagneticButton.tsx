"use client";

import type { HTMLMotionProps } from "framer-motion";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

export function MagneticButton({
  className,
  children,
  ...props
}: HTMLMotionProps<"button">) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 140, damping: 18 });
  const springY = useSpring(y, { stiffness: 140, damping: 18 });

  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    x.set(offsetX * 0.15);
    y.set(offsetY * 0.15);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      {...props}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className={cn("relative inline-flex items-center justify-center", className)}
    >
      {children}
    </motion.button>
  );
}

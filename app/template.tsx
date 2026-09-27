"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col w-full"
    >
      {children}
    </motion.div>
  );
}

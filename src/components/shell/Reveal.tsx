"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Observe an unclipped wrapper, animate the clipped child — immune to the
 *  overflow-hidden IntersectionObserver deadlock. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-8% 0px" });
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Line-mask reveal for display type: text rises out of an overflow clip. */
export function LineReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "112%" }}
        animate={inView ? { y: "0%" } : { y: "112%" }}
        transition={{ duration: 1.05, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Horizontal hairline that draws itself in. */
export function DrawnLine({ delay = 0, className }: { delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-px w-full origin-left bg-hairline"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.3, ease: EASE, delay }}
      />
    </div>
  );
}

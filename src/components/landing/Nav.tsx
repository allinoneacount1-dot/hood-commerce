"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSmoothScroll } from "@/components/shell/SmoothScroll";
import { ArrowMark } from "@/components/brand/ArrowMark";

const LINKS = [
  { id: "doctrine", label: "Doctrine" },
  { id: "pipeline", label: "Pipeline" },
  { id: "snipe", label: "Snipe" },
  { id: "guardrails", label: "Guardrails" },
  { id: "roster", label: "Roster" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollToId } = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        scrolled ? "border-b border-hairline bg-bg/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <ArrowMark className="h-7 w-7 text-ember transition-transform duration-500 ease-hunt group-hover:rotate-45" />
          <span className="font-display text-[17px] font-semibold tracking-tight text-parchment">
            Hood Commerce
          </span>
          <span className="chip hidden sm:inline-flex">Robinhood Chain</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToId(l.id)}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-parchment"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <Link href="/desk" className="btn-ember h-9 px-4 text-[11px]">
          Open the desk
        </Link>
      </div>
    </motion.header>
  );
}

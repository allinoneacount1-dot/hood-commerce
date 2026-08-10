"use client";

import dynamic from "next/dynamic";
import { SmoothScroll } from "@/components/shell/SmoothScroll";
import { Preloader } from "@/components/shell/Preloader";
import { Cursor } from "@/components/shell/Cursor";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Doctrine } from "@/components/landing/Doctrine";
import { Pipeline } from "@/components/landing/Pipeline";
import { SnipeTeaser } from "@/components/landing/SnipeTeaser";
import { Guardrails } from "@/components/landing/Guardrails";
import { ScannerTeaser } from "@/components/landing/ScannerTeaser";
import { Roster } from "@/components/landing/Roster";
import { Business } from "@/components/landing/Business";
import { Finale } from "@/components/landing/Finale";

const LandingScene = dynamic(() => import("@/components/three/LandingScene"), {
  ssr: false,
});

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      <Cursor />
      <div className="grain-overlay" />
      <LandingScene />
      <Nav />
      <main className="relative z-[2]">
        <Hero />
        <Doctrine />
        <Pipeline />
        <SnipeTeaser />
        <Guardrails />
        <ScannerTeaser />
        <Roster />
        <Business />
        <Finale />
      </main>
    </SmoothScroll>
  );
}

import type { Metadata } from "next";
import { DeskShell } from "@/components/desk/DeskShell";

export const metadata: Metadata = {
  title: "The Desk — Hood Commerce",
  description:
    "Command, Snipe, Scanner, Routes, Quiver, Ledger — the working sandbox console of Hood Commerce.",
  robots: { index: false },
};

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return <DeskShell>{children}</DeskShell>;
}

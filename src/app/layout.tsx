import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/archivo";
import "@fontsource-variable/martian-mono";
import "./globals.css";
import { QueryProvider } from "@/providers/query";

export const metadata: Metadata = {
  metadataBase: new URL("https://hood-commerce.vercel.app"),
  title: "Hood Commerce — Commerce that hunts",
  description:
    "Autonomous AI-agent commerce on Robinhood Chain. Natural-language intent → compiled payload → simulation & guardrails → session-key execution → signed settlement. Live data, real cryptography, sandbox custody.",
  openGraph: {
    type: "website",
    title: "Hood Commerce — Commerce that hunts",
    description:
      "Aim an intent. The agent draws the simulation. Nothing is loosed outside your guardrails.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hood Commerce — Commerce that hunts",
    description:
      "Autonomous AI-agent commerce: intent → simulation → guardrails → signed settlement.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0B0908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

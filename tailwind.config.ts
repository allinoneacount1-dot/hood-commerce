import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#060913",
          alt: "#0a0f24",
          surface: "#0d1326",
          elevated: "#141c38",
        },
        accent: {
          emerald: "#00f5a0",
          emeraldGlow: "rgba(0, 245, 160, 0.15)",
          gold: "#ffd700",
          crimson: "#ff3b5c",
        },
        slate: {
          border: "#1e293b",
          borderSubtle: "#0f172a",
        }
      },
      fontFamily: {
        display: ["var(--font-clash)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

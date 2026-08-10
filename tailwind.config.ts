import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0908",
        surface: "#141110",
        elevated: "#1B1715",
        hairline: "#2A241F",
        "hairline-soft": "#1F1B17",
        parchment: "#EDE6DA",
        muted: "#9A9188",
        faint: "#6E675F",
        ember: "#FF4A1F",
        "ember-hot": "#FF6A3D",
        oxblood: "#7A1F1B",
        moss: "#8FA98B",
        clay: "#B0685A",
      },
      fontFamily: {
        display: ["'Fraunces Variable'", "Georgia", "serif"],
        sans: ["'Archivo Variable'", "system-ui", "sans-serif"],
        mono: ["'Martian Mono Variable'", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        hunt: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;

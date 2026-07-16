import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1A237E",
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          900: "#1A237E",
        },
        ink: "#0F1729",
        muted: "#5B6B85",
        line: "#E4E9F2",
        soft: "#F5F8FC",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,41,.05), 0 6px 20px rgba(15,23,41,.07)",
        hover: "0 6px 14px rgba(15,23,41,.10), 0 18px 44px rgba(15,23,41,.14)",
      },
      maxWidth: { container: "1200px" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fade-up .5s ease both" },
    },
  },
  plugins: [],
};
export default config;

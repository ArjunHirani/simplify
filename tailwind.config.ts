// tailwind.config.ts
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
        // Core palette
        "bg-base":     "#0B0B1A",
        "bg-card":     "#17172B",
        "bg-input":    "#12121F",

        // Accents
        accent:        "#FF4F79",
        "accent-hover":"#FF6B8F",

        // Status
        positive:      "#4ADE80",
        negative:      "#FF6B6B",

        // Text
        "text-primary":  "#FFFFFF",
        "text-secondary":"#A1A1AA",
        "text-muted":    "#52526E",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "xl": "14px",
        "2xl": "18px",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease",
        "float":   "floatUp 3s ease-in-out infinite",
        "spin-slow":"spin 0.7s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatUp: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        "accent-glow": "0 8px 24px rgba(255, 79, 121, 0.3)",
        "card": "0 1px 3px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
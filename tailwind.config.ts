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
        zen: {
          950: "#07090D",
          900: "#0D1117",
          850: "#121721",
          800: "#161B26",
          700: "#222938",
          600: "#2F374A",
          gold: "#E5C07B",
          amber: "#F4A261",
          leaf: "#4A7C59",
          dew: "#A8DADC",
          mist: "#E8ECF5"
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
          "100%": { opacity: "0.4" },
        }
      }
    },
  },
  plugins: [],
};
export default config;

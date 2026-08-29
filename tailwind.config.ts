import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors inspired by Productivity Shastra — deep navy + saffron accent
        ink: {
          50: "#f5f6f8",
          100: "#e8eaef",
          200: "#cbd0db",
          300: "#9aa3b3",
          400: "#6c7689",
          500: "#4a5568",
          600: "#2d3748",
          700: "#1f2937",
          800: "#111827",
          900: "#0a0e1a",
        },
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

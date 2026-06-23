import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D04A02",
          dark: "#A83A02",
          light: "#FBE7DB",
        },
        compliant: "#1F8A4C",
        exceeds: "#C0392B",
        review: "#E08E00",
      },
      fontFamily: {
        hebrew: ["David", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

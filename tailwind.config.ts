import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#201a1c",
        ivory: "#fbf7f1",
        berry: "#8e294d",
        "berry-dark": "#631a36",
        blush: "#f5dce4",
        gold: "#b88945",
        sage: "#526b5a",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(63, 34, 44, 0.10)",
        card: "0 12px 32px rgba(63, 34, 44, 0.08)",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

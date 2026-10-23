import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f6fe",
          100: "#e0edfd",
          200: "#bad8fc",
          300: "#7fbcf9",
          400: "#3b9bf4",
          500: "#137de6",
          600: "#0961c5",
          700: "#094da0",
          800: "#0c4283",
          900: "#10386d",
          950: "#0b2347",
        },
      },
    },
  },
  plugins: [],
};

export default config;

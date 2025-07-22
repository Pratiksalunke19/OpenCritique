/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f97316",
        "primary-hover": "#ea580c",
        "primary-light": "#fcd34d",
        "bg-base": "#0f172a",
        "bg-panel": "#1e293b",
        "text-base": "#e2e8f0",
        "text-muted": "#94a3b8",
        border: "#334155",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ['"Inter"', "sans-serif"], // or 'Manrope'
      },
    },
  },
  plugins: [],
};

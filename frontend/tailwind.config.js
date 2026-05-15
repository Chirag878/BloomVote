/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        petal: {
          50: "#fff5f7",
          100: "#ffe5eb",
          300: "#ff9fb5",
          500: "#e95f83",
          700: "#b9345a",
        },
        leaf: {
          50: "#f0fbf4",
          100: "#d9f4e2",
          300: "#8fd5a4",
          500: "#3f9d65",
          700: "#247045",
        },
        tide: {
          50: "#effafa",
          100: "#d5f0f0",
          300: "#80ced0",
          600: "#248b93",
        },
        ink: "#24302f",
        moss: "#5c6f5f",
        nectar: "#e7b85c",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(36, 48, 47, 0.11)",
        petal: "0 12px 30px rgba(233, 95, 131, 0.18)",
      },
      backgroundImage: {
        "blossom-field":
          "linear-gradient(135deg, rgba(255,245,247,0.92), rgba(240,251,244,0.88) 46%, rgba(239,250,250,0.92)), radial-gradient(circle at top left, rgba(233,95,131,0.14), transparent 32%)",
      },
    },
  },
  plugins: [],
};

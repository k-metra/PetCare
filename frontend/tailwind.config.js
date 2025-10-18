/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-primary": {
          DEFAULT: "#1BA3AB",
          100: "#A7E3E6",
          200: "#7ED9DD",
          300: "#55CED4",
          400: "#2CC4CA",
          500: "#1BA3AB",
          600: "#16838A",
          700: "#116269",
          800: "#0B4149",
          900: "#061F28",
        }
      }
    },
  },
  plugins: [],
}


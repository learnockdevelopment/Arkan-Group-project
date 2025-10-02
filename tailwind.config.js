/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",   // include mdx if using
    "./pages/**/*.{js,ts,jsx,tsx}",     // if you still have /pages
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",       // if you use src/ structure
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A4973",
        secondary: "#FBBC04",
      },
    },
  },
  plugins: [],
};

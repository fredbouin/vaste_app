/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css"  // Add this line to include CSS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
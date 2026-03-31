/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",       // app folder ke saare files
    "./app/components/**/*.{ts,tsx,js,jsx}", // components folder
    "./app/public/**/*.{ts,tsx,js,jsx}",   // public pages
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
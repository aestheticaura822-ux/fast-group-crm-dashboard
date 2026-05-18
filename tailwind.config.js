/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",       // all files in app folder
    "./app/components/**/*.{ts,tsx,js,jsx}", // all components
    "./app/(public)/**/*.{ts,tsx,js,jsx}",   // your public pages
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
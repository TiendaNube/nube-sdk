/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./popup.html",
    "./options.html",
    "./newtab.html",
    "./devtools.html",
    "./sidepanel.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}

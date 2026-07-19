/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#392419',
          50: '#F6F4F3',
          100: '#EAE6E4',
          500: '#392419',
          600: '#2C1B12',
        }
      }
    },
  },
  plugins: [],
}

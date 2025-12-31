/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Support dark mode as a first-class citizen
  theme: {
    extend: {
      colors: {
        // Neutral palette for a clean, non-intrusive UI
        primary: { DEFAULT: '#2563eb', dark: '#3b82f6' },
        surface: { 50: '#f9fafb', 100: '#f3f4f6', 900: '#111827' },
      },
      borderRadius: {
        'base': '0.75rem', // Soft rounded components
      },
    },
  },
  plugins: [],
}
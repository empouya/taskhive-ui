import type { Config } from 'tailwindcss'

export default {
  // Ensure all feature and component paths are captured
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Essential for the "Dark mode first-class" requirement [cite: 175]
  theme: {
    extend: {
      colors: {
        // TaskHive Neutral Palette [cite: 34, 170]
        primary: {
          DEFAULT: '#2563eb', // Blue 600
          foreground: '#ffffff',
        },
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827',
        }
      },
      borderRadius: {
        'base': '0.75rem', // Soft rounded components per project rules [cite: 171]
      },
    },
  },
  plugins: [],
} satisfies Config
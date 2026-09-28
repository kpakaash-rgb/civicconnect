/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          green: '#16a34a',
          'green-light': '#22c55e',
          'green-dark': '#15803d',
          'green-50': '#f0fdf4',
          'green-100': '#dcfce7',
          'green-200': '#bbf7d0',
          'green-600': '#16a34a',
          'green-700': '#15803d',
        },
        surface: '#ffffff',
        background: '#f9fafb',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

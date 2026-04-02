/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'neon-emerald': '#00ff88',
        'neon-emerald-dim': '#00cc6a',
      },
      animation: {
        'scroll-left': 'scrollLeft 40s linear infinite',
        'pulse-fast': 'pulse 0.8s ease-in-out',
      },
      keyframes: {
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

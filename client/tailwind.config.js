/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Named after natural dyes used in Indian textiles
        indigo: { DEFAULT: '#26336B', deep: '#1A2350', soft: '#E6E8F2' },
        madder: '#A63A2B',
        turmeric: '#D49A1A',
        paper: '#FFFFFF',
        stone: { DEFAULT: '#6B6A66', line: '#E4E1DA' },
        leaf: '#2F6B4F',
      },
      fontFamily: {
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
        display: ['"Young Serif"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070D18',
          900: '#0B1323', // Primary deep SaaS navy
          850: '#101B30',
          800: '#15243E',
          700: '#1E3356',
          600: '#2A4674',
        },
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dccf',
          300: '#9ec1ae',
          400: '#719f86',
          500: '#4e8167',
          600: '#3a6651',
          700: '#2f5242',
          800: '#1a3826',
          900: '#193324',
          950: '#0f2217',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f5f0e6',
          300: '#efe8d8',
          400: '#e7dfce',
          500: '#dad0bc',
          600: '#c5b8a1',
          700: '#9e917a',
          800: '#7d7260',
          900: '#645b4d',
          950: '#352f27',
        },
        gold: {
          300: '#f5e08b',
          400: '#ebd05a',
          500: '#d4af37', // Ganesha Gold
          600: '#c59b27',
          700: '#a37a1d',
        },
        terracotta: {
          500: '#c85a32',
          600: '#b24c26',
        },
        sand: {
          100: '#FAF6EE',
          200: '#EFE8D8',
          300: '#E2DACB',
          400: '#DDD4C2',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-sora)', 'sans-serif'],
        heading: ['var(--font-sora)', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(11, 19, 35, 0.06)',
        'elevated': '0 16px 36px -4px rgba(11, 19, 35, 0.16)',
        'glow-gold': '0 0 24px -2px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}

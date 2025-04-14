const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'green': '#006400',
        'green-primary': "#008000",
        'green-secondary': "#00FF00",
        'yellow': {
          50: '#FFD700',
          100: '#FFC125'
        },

        'linear': {
          0: '#0A093C00',
          100: '#0A093C',
        },
        'overlay': 'rgba(9, 23, 39, 0.53)',
        'translate': 'rgba(56, 56, 56, 0.58)',
        'disabled': 'rgba(255, 255, 255, 0.3)',
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", ...fontFamily.serif],
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
    container: {
      padding: {
        DEFAULT: '1rem',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('ps-scrollbar-tailwind'),
    function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '100%',
          },
          '@screen md': {
            maxWidth: '100%',
          },
          '@screen lg': {
            maxWidth: '100%',
          },
          '@screen xl': {
            maxWidth: '100%',
          },
          '@screen 2xl': {
            maxWidth: '1440px',
          },
        }
      })
    }
  ],
}
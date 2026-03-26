
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 25px 80px -12px rgba(0, 0, 0, 0.06)',
        'luxury-sm': '0 4px 24px -4px rgba(0, 0, 0, 0.05)',
        pill: '0 4px 14px -4px rgba(0, 0, 0, 0.06)',
        soft: '0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 40px -12px rgba(0, 0, 0, 0.06)',
      },
      colors: {
        canvas: '#ffffff',
        charcoal: '#171717',
        linen: '#f5f5f4',
        mist: '#fafafa',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', 
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      }
    },
  },
  plugins: [],
}

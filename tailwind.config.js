/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090A12',
        ember: '#FF7A1A',
        coral: '#FF4D6D',
        lime: '#B7FF5A',
        skyglass: '#7DE3FF',
      },
      boxShadow: {
        glow: '0 0 45px rgba(255, 122, 26, 0.22)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255, 122, 26, 0)' },
          '50%': { boxShadow: '0 0 34px rgba(255, 122, 26, 0.28)' },
        },
      },
    },
  },
  plugins: [],
};

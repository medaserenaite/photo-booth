/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        party: {
          bg:     '#0a0704',   // smoky tavern night
          card:   '#1a1008',   // aged dark oak
          purple: '#C8860A',   // rum gold (primary)
          pink:   '#8B1A1A',   // blood crimson (secondary)
          cyan:   '#D4570C',   // candlelight ember (accent)
          yellow: '#F4D03F',   // candlelight
          green:  '#4A7C59',   // mossy green
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'flicker':     'flicker 3s ease-in-out infinite',
        'flash':       'flash 0.4s ease-out',
        'countdown':   'countdown 0.8s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%':       { opacity: 0.85 },
          '75%':       { opacity: 0.95 },
        },
        flash: {
          '0%':   { opacity: 1 },
          '100%': { opacity: 0 },
        },
        countdown: {
          '0%':   { transform: 'scale(2)',   opacity: 0 },
          '30%':  { transform: 'scale(1)',   opacity: 1 },
          '80%':  { transform: 'scale(1)',   opacity: 1 },
          '100%': { transform: 'scale(0.8)', opacity: 0 },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)',     opacity: 1 },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

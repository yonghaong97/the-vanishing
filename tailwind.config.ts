import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // iOS dark system colours
        ios: {
          bg:         '#000000',
          surface:    '#1c1c1e',
          surface2:   '#2c2c2e',
          surface3:   '#3a3a3c',
          separator:  '#38383a',
          label:      '#ffffff',
          label2:     '#ebebf5',
          label3:     '#ebebf599',
          label4:     '#ebebf52e',
          blue:       '#0a84ff',
          green:      '#30d158',
          red:        '#ff453a',
          amber:      '#ffd60a',
          indigo:     '#5e5ce6',
          teal:       '#5ac8fa',
          pink:       '#ff375f',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        phone: '48px',
        app:   '16px',
        bubble: '20px',
      },
      keyframes: {
        'dot-bounce': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%':           { transform: 'scale(1)',   opacity: '1'   },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'dot-bounce': 'dot-bounce 1.2s infinite ease-in-out',
        'slide-up':   'slide-up 0.35s cubic-bezier(0.32,0.72,0,1)',
        'fade-in':    'fade-in 0.25s ease',
      },
    },
  },
  plugins: [],
};

export default config;

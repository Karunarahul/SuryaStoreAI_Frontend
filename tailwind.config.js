/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080A0C',
          surface: '#0E1114',
          elevated: '#14181C',
          card: '#101418',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
        text: {
          primary: '#F4F6F8',
          secondary: '#8B949E',
          muted: '#5D6670',
        },
        solar: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        battery: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        load: {
          DEFAULT: '#06B6D4',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
        grid: {
          DEFAULT: '#8B5CF6',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          critical: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

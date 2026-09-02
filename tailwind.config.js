/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          dark: '#0a0f1d',
          navy: '#0f172a',
          indigo: '#1e1b4b',
          accent: '#4f46e5',
          accentHover: '#4338ca',
          accentLight: '#eef2ff',
          surface: '#ffffff',
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          muted: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'nova-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'nova-md': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03)',
        'nova-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        'nova-glow': '0 0 20px -3px rgba(79, 70, 229, 0.25)',
      }
    },
  },
  plugins: [],
}

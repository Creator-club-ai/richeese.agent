import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chrome: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        ink: '#020817',
        panel: '#ffffff',
        accent: '#2563eb',
        signal: '#d97706',
        danger: '#dc2626',
        success: '#059669',
      },
      fontFamily: {
        display: ['"Instrument Sans"', '"Pretendard Variable"', '"Pretendard"', 'sans-serif'],
        body: ['"Pretendard Variable"', '"Pretendard"', 'sans-serif'],
      },
      boxShadow: {
        editorial: '0 12px 32px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};

export default config;

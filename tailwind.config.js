/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Cores personalizadas para o tema "True Black" vs "Clean White"
        primary: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
          light: '#d1fae5',   // emerald-100
          dark: 'rgba(16, 185, 129, 0.2)', // emerald transparente para dark mode
        },
        dark: {
          bg: '#000000',      // Preto absoluto
          surface: '#121212', // Cinza muito escuro para cartões
          border: '#27272a',  // zinc-800
          text: '#e4e4e7',    // zinc-200
          muted: '#a1a1aa',   // zinc-400
        },
        light: {
          bg: '#ffffff',
          surface: '#f8f9fa', // gray-50
          border: '#e5e7eb',  // gray-200
          text: '#18181b',    // zinc-900
          muted: '#71717a',   // zinc-500
        }
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    }
  },
  plugins: [],
};

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
        // PALETA LARANJA (Substituindo Roxo/Verde)
        primary: {
          DEFAULT: '#f97316', // orange-500
          hover: '#ea580c',   // orange-600
          light: '#ffedd5',   // orange-100
          dark: 'rgba(249, 115, 22, 0.2)', // orange transparente
        },
        // PALETA DARK MODE (Baseada nas imagens)
        dark: {
          bg: '#000000',      // Preto absoluto
          surface: '#121212', // Cinza quase preto para cartões
          card: '#1c1c1e',    // Cinza um pouco mais claro para elementos internos
          border: '#27272a',  // zinc-800
          text: '#ffffff',    // Branco puro
          muted: '#a1a1aa',   // zinc-400
        },
        light: {
          bg: '#ffffff',
          surface: '#f4f4f5', // zinc-100
          border: '#e4e4e7',  // zinc-200
          text: '#18181b',    // zinc-900
          muted: '#71717a',   // zinc-500
        }
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(249, 115, 22, 0.4)', // Glow laranja
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: [],
};

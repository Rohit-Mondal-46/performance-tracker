/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'rotate-y': 'rotate-y 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-in': 'bounce-in 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'magnetic': 'magnetic-pull 0.3s ease-out forwards',
        'card-float': 'card-float 6s ease-in-out infinite',
      },
      keyframes: {
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-20px)'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        },
        'rotate-y': {
          'from': {
            transform: 'rotateY(0deg)'
          },
          'to': {
            transform: 'rotateY(360deg)'
          }
        },
        'glow': {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.3)'
          },
          '50%': {
            'box-shadow': '0 0 40px rgba(59, 130, 246, 0.6)'
          }
        },
        'shimmer': {
          '0%': {
            'background-position': '-200px 0'
          },
          '100%': {
            'background-position': 'calc(200px + 100%) 0'
          }
        },
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3) translateY(50px)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05) translateY(-10px)'
          },
          '70%': {
            transform: 'scale(0.9) translateY(0px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0px)'
          }
        },
        'scale-in': {
          'from': {
            opacity: '0',
            transform: 'scale(0.8)'
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'slide-in-left': {
          'from': {
            opacity: '0',
            transform: 'translateX(-100px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'slide-in-right': {
          'from': {
            opacity: '0',
            transform: 'translateX(100px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'wiggle': {
          '0%, 7%': {
            transform: 'rotateZ(0)'
          },
          '15%': {
            transform: 'rotateZ(-15deg)'
          },
          '20%': {
            transform: 'rotateZ(10deg)'
          },
          '25%': {
            transform: 'rotateZ(-10deg)'
          },
          '30%': {
            transform: 'rotateZ(6deg)'
          },
          '35%': {
            transform: 'rotateZ(-4deg)'
          },
          '40%, 100%': {
            transform: 'rotateZ(0)'
          }
        },
        'morph': {
          '0%, 100%': {
            'border-radius': '60% 40% 30% 70% / 60% 30% 70% 40%'
          },
          '50%': {
            'border-radius': '30% 60% 70% 40% / 50% 60% 30% 60%'
          }
        },
        'text-glow': {
          '0%, 100%': {
            'text-shadow': '0 0 20px rgba(59, 130, 246, 0.5)'
          },
          '50%': {
            'text-shadow': '0 0 40px rgba(139, 92, 246, 0.8)'
          }
        },
        'pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 5px rgba(59, 130, 246, 0.3)'
          },
          '50%': {
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.3)'
          }
        },
        'magnetic-pull': {
          '0%': {
            transform: 'scale(1) rotate(0deg)'
          },
          '50%': {
            transform: 'scale(1.05) rotate(1deg)'
          },
          '100%': {
            transform: 'scale(1.1) rotate(0deg)'
          }
        },
        'card-float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotateX(0deg) rotateY(0deg)'
          },
          '50%': {
            transform: 'translateY(-10px) rotateX(2deg) rotateY(1deg)'
          }
        }
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
        '500': '500px',
        '1500': '1500px',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      backfaceVisibility: {
        'hidden': 'hidden',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
    },
  },
  plugins: [],
};
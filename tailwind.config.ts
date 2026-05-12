import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Jofi — azul oficial extraído da logo
        primary: {
          DEFAULT: '#7090D8',
          50: '#F0F4FB',
          100: '#DCE5F4',
          300: '#A4B8E5',
          500: '#7090D8',
          600: '#5773C0',
          700: '#3F5BA3',
        },
        // Secondary = background limpo (criativos Jofi têm bastante branco)
        secondary: { DEFAULT: '#FFFFFF' },
        cream: {
          DEFAULT: '#F5F7FA',
          50: '#F5F7FA',
        },
        // Brand Jofi — laranja oficial extraído do criativo Sereninho + camisetas
        accent: {
          DEFAULT: '#E07A2E',
          100: '#FBE5D2',
          300: '#F0B485',
          500: '#E07A2E',
          600: '#C66622',
          700: '#9B4E18',
        },
        success: {
          DEFAULT: '#4CAF82',
          300: '#A8DEC2',
          500: '#4CAF82',
          700: '#1F6B47',
        },
        warning: { DEFAULT: '#E07A2E' },
        error: { DEFAULT: '#D93B3B' },
        whatsapp: {
          DEFAULT: '#25D366',
          500: '#25D366',
          600: '#1EBE5A',
        },
        // Neutros baseados em azul-marinho pra harmonizar com o primary
        neutral: {
          100: '#F5F7FA',
          300: '#D6DCE8',
          500: '#8590A8',
          700: '#454F66',
          900: '#1A1F36',
        },
        // Tiers do quiz mapeados ao brand
        tier: {
          hot: '#E07A2E',    // quente → laranja (urgência/Parceiro)
          warm: '#7090D8',   // morno → azul brand (Sereno)
          cold: '#A4B8E5',   // frio → azul claro (Sereninho)
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', ...fontFamily.sans],
        display: ['var(--font-anton)', 'Anton', 'Impact', ...fontFamily.sans],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['14px', { lineHeight: '1.4' }],
        base: ['16px', { lineHeight: '1.5' }],
        md: ['17px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.4' }],
        xl: ['24px', { lineHeight: '1.2' }],
        '2xl': ['28px', { lineHeight: '1.2' }],
        '3xl': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '4xl': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '5xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        '6xl': ['56px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      fontWeight: {
        regular: '400',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        '2xl': '16px',
        '3xl': '24px',
        xl: '24px',
        pill: '9999px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      maxWidth: {
        mobile: '420px',
        desktop: '600px',
        wide: '1120px',
      },
      minHeight: {
        tap: '44px',
        'tap-comfort': '56px',
        cta: '56px',
        input: '52px',
      },
      boxShadow: {
        'jofi-1': '0 1px 2px 0 rgba(26, 31, 54, 0.06)',
        'jofi-2': '0 2px 8px 0 rgba(26, 31, 54, 0.08)',
        'jofi-3': '0 8px 24px -4px rgba(26, 31, 54, 0.12)',
        'jofi-focus': '0 0 0 3px rgba(112, 144, 216, 0.32)',
      },
      transitionDuration: {
        instant: '80ms',
        fast: '150ms',
        base: '280ms',
        slow: '480ms',
      },
      transitionTimingFunction: {
        'jofi-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'jofi-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'jofi-spring': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
      },
      zIndex: {
        base: '0',
        raised: '10',
        sticky: '100',
        overlay: '1000',
        modal: '1100',
        toast: '1200',
      },
      screens: {
        sm: '360px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

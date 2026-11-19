import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design system oficial da Jofi (29/09/2026): 01_Marca/design-system/tokens.json.
        // Oficiais: azul #009af2, laranja #ff9625, amarelo #ffff44, azul-tinta #004f78,
        // tinta-media #2f5a73, fundo-suave #eaf6fe, borda-suave #d7ecfa, realce-suave #ffe3c2.
        // Os degraus que o DS não tem (300 e 600 do azul e do laranja, 700 do laranja) são
        // derivados daqui; ver design-system/README.md.
        primary: {
          DEFAULT: '#009af2', // azul (oficial)
          50: '#eaf6fe', // fundo-suave (oficial)
          100: '#d7ecfa', // borda-suave (oficial)
          300: '#7fcdf8', // derivado: azul a ~50% sobre branco
          500: '#009af2', // azul (oficial)
          600: '#0079bf', // derivado: hover do azul e texto de link (4,7:1 sobre branco)
          700: '#004f78', // azul-tinta (oficial)
        },
        // Secondary = fundo limpo
        secondary: { DEFAULT: '#FFFFFF' },
        // "cream" é o nome antigo do fundo de seção: agora é o fundo-suave do DS
        cream: {
          DEFAULT: '#eaf6fe',
          50: '#eaf6fe',
        },
        accent: {
          DEFAULT: '#ff9625', // laranja (oficial)
          100: '#ffe3c2', // realce-suave (oficial)
          300: '#ffbe78', // derivado: laranja a ~60% sobre branco
          500: '#ff9625', // laranja (oficial)
          600: '#b35f00', // derivado: texto laranja legível sobre branco (5:1), usado em erro
          700: '#8a4800', // derivado
        },
        // Amarelo do DS: destaque (palavra em título sobre azul, tag de campanha)
        highlight: { DEFAULT: '#ffff44' },
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
        // Neutros do DS: texto em azul-tinta e tons de apoio (nunca preto puro sobre fundo claro)
        neutral: {
          100: '#eaf6fe', // fundo-suave (oficial)
          300: '#d7ecfa', // borda-suave (oficial)
          500: '#4f7389', // derivado: texto de apoio e rótulo (5:1 sobre branco)
          700: '#2f5a73', // tinta-media (oficial)
          900: '#004f78', // azul-tinta (oficial)
        },
        // Tiers do quiz mapeados ao brand
        tier: {
          hot: '#ff9625', // quente → laranja
          warm: '#009af2', // morno → azul
          cold: '#7fcdf8', // frio → azul claro
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
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

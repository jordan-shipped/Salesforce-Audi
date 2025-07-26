/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Colors from design tokens
      colors: {
        primary: {
          blue: '#007AFF',
          gradient: 'linear-gradient(90deg, #0060DF 0%, #00C6FF 100%)',
        },
        text: {
          primary: '#000000',
          secondary: '#3C3C4399',
          tertiary: '#3C3C434D',
          'on-primary': '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F2F2F7',
        },
        border: {
          DEFAULT: '#E5E5EA',
        },
        error: '#FF3B30',
        accent: '#007AFF',
        'accent-30': '#007AFF4D',
        'text-black': '#1C1C1E',
        'text-grey-600': '#3A3A3C',
        'text-grey-300': '#AEAEB2',
        'background-page': '#F5F5F7',
        'background-card': '#FFFFFF',
        'border-subtle': '#D2D2D7',
      },
      
      // Typography from design tokens
      fontSize: {
        'hero': ['34pt', { lineHeight: '41pt', fontWeight: '700' }],
        'section': ['28pt', { lineHeight: '34pt', fontWeight: '600' }],
        'modal-title': ['22pt', { lineHeight: '28pt', fontWeight: '600' }],
        'body-large': ['17pt', { lineHeight: '22pt', fontWeight: '400' }],
        'body-regular': ['15pt', { lineHeight: '20pt', fontWeight: '400' }],
        'caption': ['13pt', { lineHeight: '18pt', fontWeight: '400' }],
        'h1': ['28pt', { lineHeight: '32pt' }],
        'h2': ['18pt', { lineHeight: '22pt' }],
        'body': ['14pt', { lineHeight: '20pt' }],
        'body-medium': ['16pt', { lineHeight: '24pt' }],
      },
      
      // Font families
      fontFamily: {
        'sf': ['"SF Pro Display"', '"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'sf-mono': ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Consolas', 'monospace'],
      },
      
      // Font weights
      fontWeight: {
        'regular': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      
      // Spacing from design tokens (8px grid system)
      spacing: {
        '1': '4px',   // xs
        '2': '8px',   // sm  
        '4': '16px',  // md
        '6': '24px',  // lg
        '8': '32px',  // xl
        '12': '48px', // xxl
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        '4px': '4px',
        '8px': '8px',
        '12px': '12px',
        '16px': '16px',
        '24px': '24px',
        '32px': '32px',
        '40px': '40px',
        '48px': '48px',
      },
      
      // Border radius from design tokens
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '9999px',
      },
      
      // Box shadows from design tokens
      boxShadow: {
        'default': '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 12px rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
        'subtle': 'none',
        'hover': '0 2px 4px rgba(0, 0, 0, 0.12)',
      },
      
      // Animation and transitions
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },
  plugins: [],
};
// Apple-Inspired Design Token System
// Single source of truth for all design values

export const colors = {
  // Primary Colors
  primaryBlue: '#007AFF',
  primaryGradient: 'linear-gradient(90deg, #0060DF 0%, #00C6FF 100%)',
  
  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#3C3C4399', // 60% opacity
  textTertiary: '#3C3C434D', // 30% opacity
  textOnPrimary: '#FFFFFF',
  
  // Background Colors
  background: '#FFFFFF',
  surfaceLight: '#F2F2F7',
  
  // Border Colors
  border: '#E5E5EA',
  
  // Status Colors
  errorRed: '#FF3B30',
};

export const typography = {
  // Font Family
  fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  
  // Typography Scale
  heroH1: {
    size: '34pt',
    weight: 700,
    lineHeight: '41pt',
  },
  sectionH2: {
    size: '28pt', 
    weight: 600,
    lineHeight: '34pt',
  },
  modalTitleH3: {
    size: '22pt',
    weight: 600,
    lineHeight: '28pt',
  },
  bodyLarge: {
    size: '17pt',
    weight: 400,
    lineHeight: '22pt',
  },
  bodyRegular: {
    size: '15pt',
    weight: 400,
    lineHeight: '20pt',
  },
  caption: {
    size: '13pt',
    weight: 400,
    lineHeight: '18pt',
  },
  
  // Font Weights
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  // Base unit: 4px
  xs: '4px',
  sm: '8px', 
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const radius = {
  // Corner Radius
  sm: '8px',  // buttons & inputs
  md: '12px', // cards & modals
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const shadow = {
  // Apple-style shadows
  default: `
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.06)
  `,
  elevated: `
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 6px 12px rgba(0, 0, 0, 0.06)
  `,
  modal: `
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05)
  `,
};

export const components = {
  // Component-specific specifications
  button: {
    primary: {
      background: colors.primaryGradient,
      color: colors.textOnPrimary,
      fontSize: typography.bodyLarge.size,
      lineHeight: typography.bodyLarge.lineHeight,
      padding: `${spacing.sm} ${spacing.lg}`, // 12px vertical, 24px horizontal
      borderRadius: radius.sm,
      boxShadow: shadow.default,
    },
    secondary: {
      background: colors.surfaceLight,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      fontSize: typography.bodyLarge.size,
      lineHeight: typography.bodyLarge.lineHeight,
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: radius.sm,
    },
  },
  
  input: {
    height: '44px',
    padding: spacing.sm, // 12px
    background: colors.surfaceLight,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.sm,
    fontSize: typography.bodyRegular.size,
    color: colors.textPrimary,
    placeholderColor: colors.textTertiary,
  },
  
  card: {
    background: colors.surfaceLight,
    padding: spacing.md, // 16px all around
    borderRadius: radius.md,
    boxShadow: shadow.default,
    headlineSize: typography.bodyLarge.size,
    headlineColor: colors.textPrimary,
    subtextSize: typography.caption.size,
    subtextColor: colors.textSecondary,
    accentColor: colors.primaryBlue,
  },
  
  modal: {
    padding: `${spacing.lg} ${spacing.xl}`, // 24px top/bottom, 32px left/right
    borderRadius: radius.md,
    boxShadow: shadow.modal,
    titleSize: typography.modalTitleH3.size,
    titleWeight: typography.modalTitleH3.weight,
    titleLineHeight: typography.modalTitleH3.lineHeight,
    closeButtonSize: '24px',
    closeButtonColor: colors.textTertiary,
  },
};

// CSS Custom Properties for use in CSS files
export const cssVariables = {
  // Colors
  '--color-primary-blue': colors.primaryBlue,
  '--color-text-primary': colors.textPrimary,
  '--color-text-secondary': colors.textSecondary,
  '--color-text-tertiary': colors.textTertiary,
  '--color-text-on-primary': colors.textOnPrimary,
  '--color-background': colors.background,
  '--color-surface-light': colors.surfaceLight,
  '--color-border': colors.border,
  '--color-error-red': colors.errorRed,
  
  // Typography
  '--font-family': typography.fontFamily,
  '--font-size-hero': typography.heroH1.size,
  '--font-size-section': typography.sectionH2.size,
  '--font-size-modal-title': typography.modalTitleH3.size,
  '--font-size-body-large': typography.bodyLarge.size,
  '--font-size-body-regular': typography.bodyRegular.size,
  '--font-size-caption': typography.caption.size,
  
  // Spacing
  '--space-xs': spacing.xs,
  '--space-sm': spacing.sm,
  '--space-md': spacing.md,
  '--space-lg': spacing.lg,
  '--space-xl': spacing.xl,
  '--space-xxl': spacing.xxl,
  
  // Radius
  '--radius-sm': radius.sm,
  '--radius-md': radius.md,
  '--radius-lg': radius.lg,
  '--radius-xl': radius.xl,
  '--radius-full': radius.full,
  
  // Shadows
  '--shadow-default': shadow.default,
  '--shadow-elevated': shadow.elevated,
  '--shadow-modal': shadow.modal,
};
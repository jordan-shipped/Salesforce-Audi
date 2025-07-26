// Core Design Tokens - Single Source of Truth
// Apple-grade design system tokens

export const Colors = {
  TextPrimary: '#1D1D1F',
  TextSecondary: '#3C3C4399', 
  AccentBlue: '#007AFF',
  Background: '#FFFFFF',
  CardBackground: '#F2F2F7',
  Border: '#D1D1D6',
  PlaceholderGray: '#8E8E93',
};

export const Typography = {
  H1: { 
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif', 
    fontSize: '34px', 
    fontWeight: 700, 
    lineHeight: '41px' 
  },
  H2: { 
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif', 
    fontSize: '28px', 
    fontWeight: 700, 
    lineHeight: '34px' 
  },
  H3: { 
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif', 
    fontSize: '22px', 
    fontWeight: 600, 
    lineHeight: '28px' 
  },
  Body: { 
    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif', 
    fontSize: '17px', 
    fontWeight: 400, 
    lineHeight: '22px' 
  },
  Caption: { 
    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif', 
    fontSize: '13px', 
    fontWeight: 400, 
    lineHeight: '18px' 
  },
};

export const Layout = {
  BorderRadius: 12,
  CardPadding: 24,
  Gutter: 16,
  SectionSpacing: 48,
};

// CSS-in-JS helper functions
export const applyTypography = (type) => ({
  fontFamily: type.fontFamily,
  fontSize: type.fontSize,
  fontWeight: type.fontWeight,
  lineHeight: type.lineHeight,
});

// CSS custom properties for use in stylesheets
export const cssVariables = {
  '--color-text-primary': Colors.TextPrimary,
  '--color-text-secondary': Colors.TextSecondary,
  '--color-accent-blue': Colors.AccentBlue,
  '--color-background': Colors.Background,
  '--color-card-background': Colors.CardBackground,
  '--color-border': Colors.Border,
  '--color-placeholder-gray': Colors.PlaceholderGray,
  
  '--font-h1-family': Typography.H1.fontFamily,
  '--font-h1-size': Typography.H1.fontSize,
  '--font-h1-weight': Typography.H1.fontWeight,
  '--font-h1-line-height': Typography.H1.lineHeight,
  
  '--font-h2-family': Typography.H2.fontFamily,
  '--font-h2-size': Typography.H2.fontSize,
  '--font-h2-weight': Typography.H2.fontWeight,
  '--font-h2-line-height': Typography.H2.lineHeight,
  
  '--font-h3-family': Typography.H3.fontFamily,
  '--font-h3-size': Typography.H3.fontSize,
  '--font-h3-weight': Typography.H3.fontWeight,
  '--font-h3-line-height': Typography.H3.lineHeight,
  
  '--font-body-family': Typography.Body.fontFamily,
  '--font-body-size': Typography.Body.fontSize,
  '--font-body-weight': Typography.Body.fontWeight,
  '--font-body-line-height': Typography.Body.lineHeight,
  
  '--font-caption-family': Typography.Caption.fontFamily,
  '--font-caption-size': Typography.Caption.fontSize,
  '--font-caption-weight': Typography.Caption.fontWeight,
  '--font-caption-line-height': Typography.Caption.lineHeight,
  
  '--layout-border-radius': `${Layout.BorderRadius}px`,
  '--layout-card-padding': `${Layout.CardPadding}px`,
  '--layout-gutter': `${Layout.Gutter}px`,
  '--layout-section-spacing': `${Layout.SectionSpacing}px`,
};
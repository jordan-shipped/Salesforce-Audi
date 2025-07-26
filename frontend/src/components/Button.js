import React from 'react';
import { colors, typography, spacing, radius, shadow } from '../designTokens';

const Button = ({ 
  variant = 'primary', 
  size = 'default',
  children, 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseStyles = {
    fontFamily: typography.fontFamily,
    fontSize: typography.bodyLarge.size,
    lineHeight: typography.bodyLarge.lineHeight,
    fontWeight: typography.weights.regular,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  };

  const variants = {
    primary: {
      background: colors.primaryGradient,
      color: colors.textOnPrimary,
      padding: `${spacing.sm} ${spacing.lg}`, // 12px vertical, 24px horizontal
      borderRadius: radius.sm,
      boxShadow: shadow.default,
      ':hover': {
        opacity: 0.95,
        transform: 'scale(1.02)',
      },
      ':active': {
        transform: 'scale(0.98)',
      },
    },
    secondary: {
      background: colors.surfaceLight,
      border: `1px solid ${colors.border}`,
      color: colors.textPrimary,
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: radius.sm,
      boxShadow: 'none',
      ':hover': {
        background: colors.border,
      },
    },
    ghost: {
      background: 'transparent',
      color: colors.primaryBlue,
      padding: `${spacing.sm} ${spacing.md}`,
      border: 'none',
      borderRadius: radius.sm,
      ':hover': {
        background: colors.surfaceLight,
      },
    },
  };

  const sizes = {
    small: {
      fontSize: typography.bodyRegular.size,
      padding: `${spacing.xs} ${spacing.md}`, // 4px 16px
    },
    default: {
      // Uses variant defaults
    },
    large: {
      fontSize: typography.bodyLarge.size,
      padding: `${spacing.md} ${spacing.xl}`, // 16px 32px
    },
  };

  const disabledStyles = disabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  } : {};

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.default;
  
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles,
    ...sizeStyles,
    ...disabledStyles,
  };

  return (
    <button
      type={type}
      className={`apple-button apple-button-${variant} ${className}`}
      style={combinedStyles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled && variantStyles[':hover']) {
          Object.assign(e.target.style, variantStyles[':hover']);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          // Reset to base styles
          Object.assign(e.target.style, combinedStyles);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && variantStyles[':active']) {
          Object.assign(e.target.style, variantStyles[':active']);
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, combinedStyles);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
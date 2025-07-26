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
    fontFamily: 'var(--font-family)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px', // var(--space-8)
  };

  const variants = {
    primary: {
      height: '28px',
      fontSize: '14pt', // var(--type-body)
      fontWeight: '500', // var(--font-weight-medium)
      color: '#FFFFFF',
      background: '#007AFF', // var(--color-accent)
      padding: '0 16px', // var(--space-16)
      ':hover': {
        background: '#0056CC',
      },
    },
    outline: {
      height: '28px',
      fontSize: '14pt', // var(--type-body)
      fontWeight: '400', // var(--font-weight-regular)
      color: '#1C1C1E', // var(--color-text-black)
      background: '#FFFFFF',
      border: '1px solid #D2D2D7', // var(--border-card)
      padding: '0 16px',
      ':hover': {
        background: '#F5F5F7',
      },
    },
    text: {
      height: 'auto',
      fontSize: '16pt',
      fontWeight: '400',
      color: '#3A3A3C', // var(--color-text-grey-600)
      background: 'transparent',
      padding: '8px',
      ':hover': {
        background: '#F5F5F7',
      },
    },
  };

  const disabledStyles = disabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  } : {};

  const variantStyles = variants[variant] || variants.primary;
  
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles,
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
          Object.assign(e.target.style, { ...combinedStyles, ...variantStyles[':hover'] });
        }
      }}
      onMouseLeave={(e) => {
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

// Export additional variants as named exports
export const ButtonPrimary = (props) => <Button variant="primary" {...props} />;
export const ButtonOutline = (props) => <Button variant="outline" {...props} />;
export const ButtonText = (props) => <Button variant="text" {...props} />;

export default Button;
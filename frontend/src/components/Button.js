import React from 'react';
import { Colors, Typography, Layout } from '../styles/tokens';

const Button = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const getButtonStyles = (variant) => {
    const baseStyles = {
      fontFamily: Typography.Body.fontFamily,
      fontSize: Typography.Body.fontSize,
      fontWeight: Typography.Body.fontWeight,
      lineHeight: Typography.Body.lineHeight,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: `${Layout.BorderRadius}px`,
      textDecoration: 'none',
    };

    const variants = {
      primary: {
        ...baseStyles,
        background: Colors.AccentBlue,
        color: Colors.Background,
        padding: '14px 24px',
        ':hover': {
          background: '#0056CC',
        },
      },
      outline: {
        ...baseStyles,
        background: 'transparent',
        color: Colors.TextPrimary,
        border: `1px solid ${Colors.Border}`,
        padding: '14px 24px',
        ':hover': {
          background: Colors.CardBackground,
        },
      },
      text: {
        ...baseStyles,
        background: 'transparent',
        color: Colors.AccentBlue,
        padding: '8px',
        ':hover': {
          background: Colors.CardBackground,
        },
      },
    };

    return variants[variant] || variants.primary;
  };

  const buttonStyles = getButtonStyles(variant);
  const disabledStyles = disabled ? {
    opacity: 0.6,
    cursor: 'not-allowed',
  } : {};

  const finalStyles = {
    ...buttonStyles,
    ...disabledStyles,
  };

  return (
    <button
      type={type}
      className={`button-${variant} ${className}`}
      style={finalStyles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled && buttonStyles[':hover']) {
          Object.assign(e.target.style, { ...finalStyles, ...buttonStyles[':hover'] });
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, finalStyles);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Export specific variants
export const ButtonPrimary = (props) => <Button variant="primary" {...props} />;
export const ButtonOutline = (props) => <Button variant="outline" {...props} />;
export const ButtonText = (props) => <Button variant="text" {...props} />;

export default Button;
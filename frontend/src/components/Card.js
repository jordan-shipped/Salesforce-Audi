import React from 'react';
import { Colors, Layout } from '../styles/tokens';

const Card = ({ 
  children, 
  className = '', 
  onClick,
  hover = true,
  ...props 
}) => {
  const cardStyles = {
    background: Colors.CardBackground,
    borderRadius: `${Layout.BorderRadius}px`,
    padding: `${Layout.CardPadding}px`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: `${Layout.Gutter / 2}px`,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
  };

  const hoverStyles = hover && onClick ? {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  } : {};

  return (
    <div
      className={`unified-card ${className}`}
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover && onClick) {
          Object.assign(e.target.style, { ...cardStyles, ...hoverStyles });
        }
      }}
      onMouseLeave={(e) => {
        if (hover && onClick) {
          Object.assign(e.target.style, cardStyles);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Card subcomponents for consistent structure
export const CardIcon = ({ children, className = '' }) => (
  <div 
    className={`card-icon ${className}`}
    style={{
      width: '24px',
      height: '24px',
      marginBottom: '8px',
      alignSelf: 'center',
    }}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 
    className={`card-title typography-h3 ${className}`}
    style={{
      margin: 0,
      textAlign: 'center',
      color: Colors.TextPrimary,
    }}
  >
    {children}
  </h3>
);

export const CardBody = ({ children, className = '' }) => (
  <div 
    className={`card-body typography-body ${className}`}
    style={{
      textAlign: 'center',
      color: Colors.TextPrimary,
      maxWidth: '240px',
      margin: '0 auto',
    }}
  >
    {children}
  </div>
);

export const CardMeta = ({ children, className = '' }) => (
  <div 
    className={`card-meta typography-caption ${className}`}
    style={{
      textAlign: 'center',
      color: Colors.TextSecondary,
    }}
  >
    {children}
  </div>
);

// Compound exports
Card.Icon = CardIcon;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Meta = CardMeta;

export default Card;
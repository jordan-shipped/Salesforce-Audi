import React from 'react';
import { colors, typography, spacing, radius, shadow, components } from '../designTokens';

const Card = ({ 
  children, 
  className = '',
  onClick,
  hover = false,
  ...props 
}) => {
  const cardStyles = {
    background: components.card.background,
    padding: components.card.padding,
    borderRadius: components.card.borderRadius,
    boxShadow: components.card.boxShadow,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
  };

  const hoverStyles = hover || onClick ? {
    boxShadow: shadow.elevated,
    transform: 'translateY(-1px)',
  } : {};

  return (
    <div
      className={`apple-card ${className}`}
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover || onClick) {
          Object.assign(e.target.style, { ...cardStyles, ...hoverStyles });
        }
      }}
      onMouseLeave={(e) => {
        if (hover || onClick) {
          Object.assign(e.target.style, cardStyles);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  const headerStyles = {
    fontSize: components.card.headlineSize,
    color: components.card.headlineColor,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  };

  return (
    <div className={`apple-card-header ${className}`} style={headerStyles}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  const contentStyles = {
    fontSize: components.card.subtextSize,
    color: components.card.subtextColor,
    lineHeight: typography.bodyRegular.lineHeight,
  };

  return (
    <div className={`apple-card-content ${className}`} style={contentStyles}>
      {children}
    </div>
  );
};

const CardAccent = ({ children, className = '' }) => {
  const accentStyles = {
    color: components.card.accentColor,
    fontSize: components.card.headlineSize,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.sm,
  };

  return (
    <div className={`apple-card-accent ${className}`} style={accentStyles}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Accent = CardAccent;

export default Card;
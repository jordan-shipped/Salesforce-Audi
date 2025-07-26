import React from 'react';

const Card = ({ 
  children, 
  className = '',
  onClick,
  hover = false,
  elevated = false,
  ...props 
}) => {
  // Determine card variant classes
  let cardClasses = 'card';
  
  if (elevated) {
    cardClasses = 'card-elevated';
  } else if (hover || onClick) {
    cardClasses = 'card-hover';
  }
  
  const combinedClasses = [cardClasses, className].filter(Boolean).join(' ');

  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`text-body-large font-medium text-text-primary mb-2 ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`text-body-regular text-text-grey-600 ${className}`}>
      {children}
    </div>
  );
};

const CardAccent = ({ children, className = '' }) => {
  return (
    <div className={`text-accent text-body-large font-semibold mt-2 ${className}`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Accent = CardAccent;

export default Card;
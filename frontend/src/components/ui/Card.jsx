import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick = null,
  ...props 
}) => {
  const baseClasses = `
    bg-white 
    rounded-2xl 
    shadow-card 
    border border-border-subtle
    transition-all duration-200
  `;
  
  const hoverClasses = hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      style={{
        padding: '24px',
        borderRadius: '16px',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
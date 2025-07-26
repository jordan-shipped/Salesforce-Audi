import React from 'react';

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
  // Base classes that apply to all buttons
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-sf transition-all duration-fast ease-apple focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';
  
  // Variant-specific classes using our design tokens
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    outline: 'btn-secondary',
    text: 'btn-text'
  };
  
  // Size variants
  const sizeClasses = {
    small: 'px-md py-1 text-body-regular',
    default: 'px-lg py-2 text-body-large',
    large: 'px-xl py-3 text-body-large'
  };
  
  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.default,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Export additional variants as named exports for convenience
export const ButtonPrimary = (props) => <Button variant="primary" {...props} />;
export const ButtonSecondary = (props) => <Button variant="secondary" {...props} />;
export const ButtonOutline = (props) => <Button variant="outline" {...props} />;
export const ButtonText = (props) => <Button variant="text" {...props} />;

export default Button;
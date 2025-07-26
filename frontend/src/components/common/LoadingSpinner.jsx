import React from 'react';

const LoadingSpinner = ({ 
  size = 'default', 
  message = 'Loading...', 
  className = '',
  showMessage = true 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-caption',
    default: 'text-body-regular',
    large: 'text-body-large'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-4 border-accent border-t-transparent 
          rounded-full animate-spin
          ${showMessage ? 'mb-2' : ''}
        `}
      />
      {showMessage && (
        <p className={`${textSizeClasses[size]} text-text-grey-600 text-center`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
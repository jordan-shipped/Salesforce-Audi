import React from 'react';

const Input = ({ 
  label,
  className = '',
  id,
  error,
  required = false,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`input ${error ? 'border-error ring-error' : ''}`}
        {...props}
      />
      
      {error && (
        <p className="text-caption text-error mt-1">{error}</p>
      )}
    </div>
  );
};

const Select = ({ 
  label,
  options = [],
  className = '',
  id,
  error,
  required = false,
  ...props 
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={`input ${error ? 'border-error ring-error' : ''}`}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-caption text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export { Input, Select };
export default Input;
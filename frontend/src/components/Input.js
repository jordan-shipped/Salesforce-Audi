import React from 'react';
import { colors, typography, spacing, radius, components } from '../designTokens';

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  error = false,
  label,
  ...props 
}) => {
  const inputStyles = {
    height: components.input.height,
    padding: components.input.padding,
    background: components.input.background,
    border: `1px solid ${error ? colors.errorRed : colors.border}`,
    borderRadius: components.input.borderRadius,
    fontSize: components.input.fontSize,
    fontFamily: typography.fontFamily,
    color: components.input.color,
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  };

  const focusStyles = {
    borderColor: colors.primaryBlue,
    borderWidth: '2px',
    boxShadow: `0 0 0 3px ${colors.primaryBlue}25`, // 25 = 15% opacity
  };

  const labelStyles = label ? {
    fontFamily: typography.fontFamily,
    fontSize: typography.caption.size,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  } : {};

  return (
    <div className={`apple-input-container ${className}`}>
      {label && (
        <label style={labelStyles} className="apple-input-label">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="apple-input"
        style={inputStyles}
        onFocus={(e) => {
          Object.assign(e.target.style, focusStyles);
        }}
        onBlur={(e) => {
          Object.assign(e.target.style, inputStyles);
        }}
        {...props}
      />
    </div>
  );
};

const Select = ({ 
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  error = false,
  label,
  ...props 
}) => {
  const selectStyles = {
    height: components.input.height,
    padding: `0 48px 0 ${spacing.sm}`, // Right padding for chevron
    background: components.input.background,
    border: `1px solid ${error ? colors.errorRed : colors.border}`,
    borderRadius: components.input.borderRadius,
    fontSize: components.input.fontSize,
    fontFamily: typography.fontFamily,
    color: components.input.color,
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4' opacity='0.5'/%3e%3c/svg%3e")`,
    backgroundPosition: `right ${spacing.md} center`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '12pt',
  };

  const focusStyles = {
    borderColor: colors.primaryBlue,
    borderWidth: '2px',
    boxShadow: `0 0 0 3px ${colors.primaryBlue}25`,
  };

  const labelStyles = label ? {
    fontFamily: typography.fontFamily,
    fontSize: typography.caption.size,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  } : {};

  return (
    <div className={`apple-select-container ${className}`}>
      {label && (
        <label style={labelStyles} className="apple-select-label">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="apple-select"
        style={selectStyles}
        onFocus={(e) => {
          Object.assign(e.target.style, focusStyles);
        }}
        onBlur={(e) => {
          Object.assign(e.target.style, selectStyles);
        }}
        {...props}
      >
        <option value="" style={{ color: colors.textTertiary }}>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

export { Input, Select };
export default Input;
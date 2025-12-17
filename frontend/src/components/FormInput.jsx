import React from 'react';

export const FormInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  disabled,
  className,
  autoComplete,
  ...props
}) => {
  const hasError = error && touched;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`form-input ${hasError ? 'error' : ''} ${className || ''}`}
        autoComplete={autoComplete}
        {...props}
      />
      {hasError && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormInput;

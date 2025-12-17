import React from 'react';

export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  dismissible = true,
  icon,
}) => {
  const typeClass = `alert-${type}`;
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`alert ${typeClass}`} role="alert">
      <div className="alert-content">
        {icon || icons[type] && <span className="alert-icon">{icon || icons[type]}</span>}
        <div className="alert-body">
          {title && <h4 className="alert-title">{title}</h4>}
          {message && <p className="alert-message">{message}</p>}
        </div>
      </div>
      {dismissible && onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export const ErrorAlert = ({ message, onClose }) => (
  <Alert type="error" title="Error" message={message} onClose={onClose} />
);

export const SuccessAlert = ({ message, onClose }) => (
  <Alert type="success" title="Success" message={message} onClose={onClose} />
);

export const WarningAlert = ({ message, onClose }) => (
  <Alert type="warning" title="Warning" message={message} onClose={onClose} />
);

export const InfoAlert = ({ message, onClose }) => (
  <Alert type="info" title="Info" message={message} onClose={onClose} />
);

export default Alert;

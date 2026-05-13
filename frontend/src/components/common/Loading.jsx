import React from 'react';

export const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner"></div>
      {text && <p>{text}</p>}
    </div>
  );
};

export const Skeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    ></div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="skeleton-table">
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={rowIdx} className="skeleton-row">
          {[...Array(cols)].map((_, colIdx) => (
            <Skeleton key={colIdx} height="40px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;

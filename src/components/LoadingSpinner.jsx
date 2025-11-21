import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className={`animate-spin rounded-full border-b-2 border-teal ${sizeClasses[size]}`}></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
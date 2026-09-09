import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return (
    <div 
      className="border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" 
      style={{ width: size, height: size }}
    />
  );
};

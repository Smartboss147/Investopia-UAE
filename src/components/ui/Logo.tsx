import React from 'react';

export const Logo: React.FC<{ className?: string; size?: number }> = ({ className, size = 38 }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="flex items-center justify-center bg-[#D4FF3D] rounded-lg shadow-lg overflow-hidden"
        style={{ width: size, height: size }}
      >
        <span className="text-black font-black text-xl leading-none">I</span>
      </div>
      <span className="font-black text-xl tracking-tighter text-white">INVESTOPIA</span>
    </div>
  );
};

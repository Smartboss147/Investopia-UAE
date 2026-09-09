import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full bg-[#1a1a1a]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#ededed] placeholder:text-gray-600 transition-all duration-200 focus:outline-none focus:border-[#D4FF3D]/50 focus:ring-1 focus:ring-[#D4FF3D]/20",
          error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

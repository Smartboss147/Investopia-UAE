import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#D4FF3D] text-black shadow-[0_0_20px_rgba(212,255,61,0.2)] hover:shadow-[0_0_30px_rgba(212,255,61,0.3)] hover:scale-[1.02] active:scale-[0.98]",
    ghost: "text-[#ededed] hover:bg-white/5",
    outline: "border border-white/10 text-[#ededed] hover:bg-white/5",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />}
      {children}
    </button>
  );
};

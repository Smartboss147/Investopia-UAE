import React from 'react';
import { cn } from '../../lib/utils';

import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hasBlobs?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hasBlobs = false }) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "relative overflow-hidden backdrop-blur-xl rounded-[24px] p-6 transition-all duration-300",
      theme === 'dark' 
        ? "bg-[#131A2E]/50 border border-white/5 shadow-2xl shadow-black/20" 
        : "bg-white border border-black/5 shadow-lg shadow-black/5",
      className
    )}>
      {hasBlobs && (
        <>
          <div className="absolute -left-16 -top-16 h-44 w-44 bg-[#2563EB] opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -right-12 -bottom-20 h-48 w-48 bg-[#D4F542] opacity-[0.05] blur-[50px] rounded-full pointer-events-none" />
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

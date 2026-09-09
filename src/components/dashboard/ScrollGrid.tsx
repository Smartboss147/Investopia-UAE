import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../utils/haptic';

interface ScrollGridItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}

interface ScrollGridProps {
  items: ScrollGridItem[];
  variant?: 'card' | 'pill';
  className?: string;
}

export const ScrollGrid: React.FC<ScrollGridProps> = ({ items, variant = 'card', className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Smooth scroll-snap settles naturally with CSS, but we can add wheel-to-horizontal mapping here too
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div 
      ref={scrollRef}
      className={cn(
        "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 py-2 mask-fade-edges",
        className
      )}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            triggerHaptic();
            item.onClick?.();
          }}
          className={cn(
            "flex-none snap-start transition-all active:scale-95 select-none",
            variant === 'card' 
              ? "w-24 h-28 bg-[#131A2E] rounded-2xl flex flex-col items-center justify-center border border-white/5" 
              : "px-6 py-2 rounded-full font-bold text-sm",
            variant === 'pill' && item.active ? "bg-[#D4FF3D] text-black" : "text-[#8A93A6]",
            variant === 'pill' && !item.active ? "hover:text-white" : ""
          )}
        >
          {variant === 'card' && (
            <>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg",
                item.color || "bg-blue-500/20 text-blue-400"
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-center px-1 leading-tight text-[#8A93A6]">
                {item.label}
              </span>
            </>
          )}
          {variant === 'pill' && item.label}
        </button>
      ))}
    </div>
  );
};

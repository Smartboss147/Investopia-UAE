import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Repeat, User, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../utils/haptic';

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/app/dashboard', icon: Home },
    { label: 'Markets', path: '/app/trading', icon: BarChart2 },
    { label: 'Staking', path: '/app/staking', icon: Lock },
    { label: 'History', path: '/app/transactions', icon: Repeat },
    { label: 'Profile', path: '/app/settings', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1326]/95 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => triggerHaptic()}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 px-4",
              isActive ? "text-[#D4FF3D]" : "text-[#8A93A6] hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(isActive && "drop-shadow-[0_0_8px_rgba(212,255,61,0.5)]")}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

import React from 'react';
import { Bell, Search, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../AuthProvider';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { profile } = useAuth();

  return (
    <header className="h-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative flex items-center">
          <div className="absolute left-3 md:left-4 text-gray-500 pointer-events-none z-10">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search..."
            className="h-10 w-10 md:w-full md:max-w-md bg-white/5 border border-white/5 rounded-full pl-10 md:pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:ring-1 focus:ring-[#2563EB]/20 transition-all focus:w-48 sm:focus:w-64 md:focus:w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#ededed] hover:bg-white/5 transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-3 h-2 w-2 bg-[#D4F542] rounded-full border-2 border-[#0a0a0a]" />
        </button>

        <div className="hidden sm:block h-8 w-px bg-white/10 mx-2" />

        <button className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 pr-1 md:pr-4 py-1 md:py-1.5 rounded-full hover:bg-white/5 transition-all group">
          <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white flex-shrink-0">
            <User size={16} />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-[#ededed] leading-none">{profile?.displayName || 'Guest Trader'}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">{profile?.status || 'Premium Member'}</p>
          </div>
          <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-300 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};

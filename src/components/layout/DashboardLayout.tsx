import React from 'react';
import { BottomNav } from '../dashboard/BottomNav';
import { Logo } from '../ui/Logo';
import { useAuth } from '../AuthProvider';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen h-[100dvh] flex items-center justify-center transition-colors duration-300",
        theme === 'dark' ? "bg-[#0A0F1E]" : "bg-[#F8FAFC]"
      )}>
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col relative transition-colors duration-300 bg-dot-grid",
      theme === 'dark' ? "bg-[#0A0F1E] text-white" : "bg-[#F8FAFC] text-[#0A0F1E]"
    )}>
      {/* Top spacing for status bars on mobile if needed, or branding header */}
      <header className="pt-8 pb-4 px-6 flex items-center justify-between">
        <Logo size={32} />
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          theme === 'dark' ? "bg-[#131A2E] border border-white/5" : "bg-white border border-black/5 shadow-sm"
        )}>
          <div className="w-2 h-2 bg-[#D4FF3D] rounded-full animate-pulse" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-24 px-6 overflow-x-hidden">
        <div className="max-w-lg mx-auto w-full pt-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

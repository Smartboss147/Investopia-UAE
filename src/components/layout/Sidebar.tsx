import React from 'react';
import { 
  LayoutDashboard, 
  Car,
  Wallet, 
  ArrowLeftRight, 
  TrendingUp, 
  History, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';
import { useAuth } from '../AuthProvider';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const location = useLocation();
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin' || 
                  user?.email === 'smartboss08161156487@gmail.com' || 
                  user?.email === 'smartcompany112234@gmail.com' || 
                  user?.email === 'prince.hamad.managementhmdzs@gmail.com';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Car, label: 'Tesla Marketplace', path: '/app/tesla' },
    { icon: Wallet, label: 'Wallets', path: '/app/wallets' },
    { icon: ArrowLeftRight, label: 'Transfers', path: '/app/transfers' },
    { icon: TrendingUp, label: 'Trading', path: '/app/trading' },
    { icon: History, label: 'Transactions', path: '/app/transactions' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: ShieldCheck, label: 'Admin Panel', path: '/admin' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed lg:sticky left-0 top-0 h-screen h-[100dvh] bg-[#0f0f0f] border-r border-white/5 transition-all duration-300 z-[70] flex-shrink-0",
          collapsed ? "w-20" : "w-64",
          "max-lg:fixed max-lg:z-[70]",
          mobileOpen ? "translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between overflow-hidden">
            {!collapsed && <Logo size={32} />}
            {collapsed && <div className="mx-auto"><Logo size={32} className="[&>span]:hidden" /></div>}
            
            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-500 hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-grow px-3 mt-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 text-[#2563EB] border border-[#2563EB]/20" 
                      : "text-gray-400 hover:text-[#ededed] hover:bg-white/5 border border-transparent"
                  )}
                >
                  <item.icon size={20} className={cn("flex-shrink-0", isActive && "text-[#2563EB]")} />
                  {!collapsed && <span className="font-medium text-sm whitespace-nowrap overflow-hidden">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-6 px-2 py-1 bg-[#1a1a1a] text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[80] hidden lg:block">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Desktop Collapse Button */}
          <div className="p-4 border-t border-white/5 hidden lg:block">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-[#ededed] bg-white/5 rounded-lg transition-colors"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

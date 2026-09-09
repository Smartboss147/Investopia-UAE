import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  CreditCard,
  Settings as SettingsIcon,
  Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../components/AuthProvider';
import { cn } from '../lib/utils';
import { triggerHaptic } from '../utils/haptic';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();

  const handleThemeToggle = () => {
    triggerHaptic();
    toggleTheme();
  };

  const handleSignOut = async () => {
    triggerHaptic(HapticPatterns.heavy);
    await signOut();
    navigate('/');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <User size={18} />, label: 'Personal Information', value: profile?.displayName },
        { icon: <CreditCard size={18} />, label: 'Payment Methods', value: '2 Linked' },
        { icon: <Globe size={18} />, label: 'Language', value: 'English (US)' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />, 
          label: 'Theme', 
          value: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
          action: (
            <button 
              onClick={handleThemeToggle}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                theme === 'dark' ? "bg-[#D4FF3D]" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                theme === 'dark' ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          )
        },
        { icon: <Bell size={18} />, label: 'Notifications', value: 'On' },
        { icon: <Shield size={18} />, label: 'Privacy & Security', value: 'Biometric On' },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4FF3D] to-emerald-500 p-1 mb-4 shadow-xl shadow-[#D4FF3D]/10">
            <div className="w-full h-full rounded-full bg-[#131A2E] flex items-center justify-center text-3xl font-black text-[#D4FF3D]">
              {profile?.displayName?.charAt(0)}
            </div>
          </div>
          <div className="absolute bottom-6 right-0 w-8 h-8 bg-[#0A0F1E] border border-white/10 rounded-full flex items-center justify-center text-[#D4FF3D]">
            <SettingsIcon size={16} />
          </div>
        </div>
        <h2 className={cn(
          "text-2xl font-black mb-1",
          theme === 'dark' ? "text-white" : "text-[#0A0F1E]"
        )}>
          {profile?.displayName}
        </h2>
        <p className="text-xs font-bold text-[#8A93A6] uppercase tracking-widest">{profile?.email}</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h3 className="px-1 text-[10px] font-black text-[#8A93A6] uppercase tracking-[0.2em]">{section.title}</h3>
            <div className={cn(
              "rounded-[24px] overflow-hidden border",
              theme === 'dark' ? "bg-[#131A2E]/50 border-white/5" : "bg-white border-black/5 shadow-sm"
            )}>
              {section.items.map((item, i) => (
                <div 
                  key={i}
                  onClick={() => !item.action && triggerHaptic()}
                  className={cn(
                    "flex items-center justify-between p-5 transition-colors cursor-pointer group",
                    theme === 'dark' ? "hover:bg-white/5" : "hover:bg-black/[0.02]",
                    i !== section.items.length - 1 && (theme === 'dark' ? "border-b border-white/5" : "border-b border-black/5")
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                      theme === 'dark' ? "bg-white/5 text-[#8A93A6] group-hover:text-white" : "bg-black/5 text-[#8A93A6] group-hover:text-[#0A0F1E]"
                    )}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-bold",
                        theme === 'dark' ? "text-white" : "text-[#0A0F1E]"
                      )}>
                        {item.label}
                      </p>
                      {item.value && !item.action && (
                        <p className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-wider">{item.value}</p>
                      )}
                    </div>
                  </div>
                  {item.action ? (
                    item.action
                  ) : (
                    <ChevronRight size={18} className="text-[#8A93A6]" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-5 rounded-[24px] bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs border border-red-500/20 active:scale-95 transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="text-center pb-8">
        <p className="text-[8px] font-black text-[#8A93A6] uppercase tracking-[0.4em]">Investopia Mobile • Version 2.0.4</p>
      </div>
    </div>
  );
};

const HapticPatterns = {
  heavy: 40,
};

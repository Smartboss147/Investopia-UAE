import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { navItems } from '../lib/investData';
import { cn } from '../lib/utils';

export const InvestHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500",
        isScrolled 
          ? "bg-[#00122e]/95 backdrop-blur-md py-3 shadow-lg" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#C5A059] flex items-center justify-center rounded-sm group-hover:scale-105 transition-transform">
            <span className="text-[#00122e] font-bold text-xl">I</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-widest text-xl leading-none">INVESTOPIA</span>
            <span className="text-[#C5A059] text-[10px] font-medium tracking-[0.2em]">WHERE INVESTMENT LIVES</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-[#C5A059]",
                location.pathname === item.path ? "text-[#C5A059]" : "text-white/90"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <button 
            className="text-white/80 hover:text-[#C5A059] transition-colors"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={20} />
          </button>
          <button className="flex items-center gap-1.5 text-white/80 hover:text-[#C5A059] transition-colors border-l border-white/20 pl-6">
            <Globe size={18} />
            <span className="text-xs font-bold">EN</span>
            <ChevronDown size={14} />
          </button>
          <Link 
            to="/app/dashboard" 
            className="bg-[#C5A059] text-[#00122e] px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
          >
            Register Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#00122e] z-[200] flex flex-col items-center justify-center p-6"
          >
            <button 
              className="absolute top-8 right-8 text-white hover:text-[#C5A059]"
              onClick={() => setIsSearchOpen(false)}
            >
              <X size={40} />
            </button>
            <div className="w-full max-w-4xl">
              <h2 className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.4em] mb-8 text-center">Search Investopia</h2>
              <input 
                autoFocus
                type="text" 
                placeholder="TYPE YOUR SEARCH HERE..."
                className="w-full bg-transparent border-b-2 border-white/20 py-8 text-3xl md:text-5xl text-white font-black placeholder:text-white/10 focus:outline-none focus:border-[#C5A059] transition-colors uppercase tracking-tight"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-[72px] bg-[#00122e] z-50 lg:hidden flex flex-col p-8"
          >
            <div className="flex flex-col gap-6 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-2xl font-bold text-white hover:text-[#C5A059] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-auto pb-12 flex flex-col gap-6">
              <button className="flex items-center gap-3 text-white text-lg">
                <Search size={24} />
                <span>Search</span>
              </button>
              <button className="flex items-center gap-3 text-white text-lg">
                <Globe size={24} />
                <span>Language: EN</span>
              </button>
              <Link 
                to="/app/dashboard" 
                className="bg-[#C5A059] text-[#00122e] py-4 text-center text-lg font-bold uppercase tracking-wider"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

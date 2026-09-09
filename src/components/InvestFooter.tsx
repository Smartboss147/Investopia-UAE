import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';
import { navItems } from '../lib/investData';

export const InvestFooter: React.FC = () => {
  return (
    <footer className="bg-[#000a1a] text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C5A059] flex items-center justify-center rounded-sm">
                <span className="text-[#00122e] font-bold text-lg">I</span>
              </div>
              <span className="text-white font-bold tracking-widest text-lg">INVESTOPIA</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Launched by the UAE Government, Investopia is a global platform designed to drive future investments and stimulate growth in the new economy.
            </p>
            <div className="flex items-center gap-4">
              {[Linkedin, Twitter, Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#C5A059] hover:border-[#C5A059] hover:text-[#00122e] transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.2em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-white/70 hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/70 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link to="/cookies" className="text-white/70 hover:text-white transition-colors text-sm">Cookie Policy</Link></li>
              <li><Link to="/sitemap" className="text-white/70 hover:text-white transition-colors text-sm">Sitemap</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.2em] mb-8">Newsletter</h4>
            <p className="text-white/60 text-sm mb-6">Stay updated with our latest news and event announcements.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#C5A059] hover:translate-x-1 transition-transform">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/40 text-[10px] uppercase tracking-widest">
            © 2026 INVESTOPIA. AN INDEPENDENT DEVELOPMENT RECREATION.
          </p>
          <div className="flex items-center gap-8">
            <span className="text-white/40 text-[10px] uppercase tracking-widest">United Arab Emirates</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest">Global Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Play } from 'lucide-react';

export const InvestHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#00122e]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=2000&auto=format&fit=crop" 
          alt="Abu Dhabi Skyline" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00122e] via-[#00122e]/80 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-[#C5A059] font-bold text-sm tracking-[0.3em] uppercase mb-6">
              Investopia Bridge 2026
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8">
              Investing in a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-white">More Resilient World</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 leading-relaxed">
              Join senior leaders to examine the economic and investment implications of a rapidly changing global environment.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/app/dashboard" className="bg-[#C5A059] text-[#00122e] px-10 py-5 font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3 group">
                Register Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-4 text-white hover:text-[#C5A059] transition-colors group">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] transition-colors">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="font-bold uppercase tracking-widest text-sm">Watch Highlights</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { label: 'Flagship Summit', desc: 'The annual gathering of global leaders' },
              { label: 'Global Editions', desc: 'Strategic dialogues in capital centers' },
              { label: 'Market Insights', desc: 'Analyzing the frontiers of new economies' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                className="border-l border-white/10 pl-6 py-2 group hover:border-[#C5A059] transition-colors"
              >
                <h4 className="text-white font-bold text-lg mb-2">{item.label}</h4>
                <p className="text-white/40 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="absolute right-0 bottom-0 w-1/3 h-1/2 bg-gradient-to-tl from-[#C5A059]/10 to-transparent pointer-events-none" />
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { initiatives } from '../lib/investData';

export const InvestInitiatives: React.FC = () => {
  return (
    <section className="bg-[#00122e] py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/3">
            <h2 className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.3em] mb-4">Investopia Ecosystem</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
              Platforms for <br />
              <span className="text-[#C5A059]">Growth</span>
            </h3>
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Explore our diverse range of initiatives designed to facilitate connections, share knowledge, and catalyze investment in the global new economy sectors.
            </p>
            <button className="bg-white text-[#00122e] px-10 py-5 font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all">
              Explore initiatives
            </button>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            {initiatives.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00122e] to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                </div>
                
                <div className="p-10 relative z-10">
                  <h4 className="text-2xl font-bold text-white mb-4 flex items-center justify-between group-hover:text-[#C5A059] transition-colors">
                    {item.title}
                    <ArrowUpRight size={20} className="text-[#C5A059] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Background Aesthetic */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#C5A059]/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
    </section>
  );
};

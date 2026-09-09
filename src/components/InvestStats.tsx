import React from 'react';
import { motion } from 'motion/react';
import { statistics } from '../lib/investData';

export const InvestStats: React.FC = () => {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {statistics.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center lg:text-left group"
            >
              <div className="text-5xl lg:text-6xl font-black text-[#00122e] mb-4 group-hover:text-[#C5A059] transition-colors">
                {stat.value}
              </div>
              <div className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                {stat.label}
              </div>
              <div className="w-12 h-1 bg-gray-100 mx-auto lg:mx-0 group-hover:w-20 group-hover:bg-[#C5A059] transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Texture Background */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
    </section>
  );
};

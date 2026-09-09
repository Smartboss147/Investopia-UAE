import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export const InvestMission: React.FC = () => {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-blue-700 leading-tight mb-8"
          >
            Investopia is a dynamic investment ecosystem where today’s economic sectors grow and tomorrow’s are born.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8 leading-relaxed"
          >
            We believe that tomorrow's economies hold the power to transform lives in ways beyond our imagination. Our mission is to create a dynamic investment hub where global stakeholders, capital, and opportunities come together to drive growth in today's economies and give birth to exciting new ones.
          </motion.p>
          <button className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm hover:gap-4 transition-all group">
            Learn more <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl"
        >
          <img 
            src="/events/investopia_mission_audience_1788863840534.jpg" 
            alt="Investopia Event" 
            className="w-full h-[600px] object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-10 md:p-12">
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-5xl">
              Investopia is a global platform connecting investors, business leaders & governments to identify new investment opportunities, drive growth and incubate future economies globally.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';

export const InvestPlatforms: React.FC = () => {
  return (
    <section className="bg-black py-32 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white leading-tight mb-8"
          >
            We connect investors, business leaders, and governments.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/70 leading-relaxed"
          >
            We're committed to building bridges between investors, business leaders, and governments through our comprehensive programs. We tackle our mission through two distinct platforms: Investopia Flagship Conference and Investopia Global.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Investopia Flagship",
              description: "Investopia's annual gathering in the UAE brings together thought leaders, investors, and innovators to drive growth and uncover investment opportunities within the new economy.",
              image: "/events/investopia_flagship_stage_1788863815327.jpg"
            },
            {
              title: "Investopia Global",
              description: "Investopia's international gatherings connect investors with opportunities worldwide and foster collaboration and partnerships between leading global centers of capital and innovation.",
              image: "/events/investopia_mission_audience_1788863840534.jpg" // Using similar high-res audience shot
            }
          ].map((platform, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-[#111] p-10 rounded-3xl group hover:bg-[#1a1a1a] transition-all duration-500 text-center"
            >
              <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-10">
                <img 
                  src={platform.image} 
                  alt={platform.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">{platform.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto">
                {platform.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

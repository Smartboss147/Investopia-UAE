import React from 'react';
import { motion } from 'motion/react';
import { InvestPageLayout } from '../components/InvestPageLayout';
import { InvestHero } from '../components/InvestHero';
import { InvestStats } from '../components/InvestStats';
import { InvestMission } from '../components/InvestMission';
import { InvestPlatforms } from '../components/InvestPlatforms';
import { InvestEvents } from '../components/InvestEvents';
import { SpeakerGallery } from '../components/SpeakerGallery';
import { InvestInitiatives } from '../components/InvestInitiatives';

export const InvestHomePage: React.FC = () => {
  return (
    <InvestPageLayout>
      <InvestHero />
      <InvestStats />
      <InvestMission />
      <InvestPlatforms />
      <InvestEvents />
      <InvestInitiatives />
      <SpeakerGallery />
      
      {/* Newsletter / CTA Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#C5A059] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 group"
          >
            <div className="max-w-xl">
              <h3 className="text-3xl md:text-5xl font-black text-[#00122e] mb-6 leading-tight">
                Be Part of the <br />
                Global Conversation
              </h3>
              <p className="text-[#00122e]/70 text-lg">
                Join our newsletter to receive the latest updates on global investment trends and flagship summit announcements.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-white px-8 py-5 text-[#00122e] focus:outline-none min-w-[300px] font-medium"
              />
              <button className="bg-[#00122e] text-white px-10 py-5 font-bold uppercase tracking-widest hover:bg-white hover:text-[#00122e] transition-all">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </InvestPageLayout>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Speaker } from '../types';

interface SpeakerCardProps {
  speaker: Speaker;
  index: number;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      className="group text-center flex flex-col items-center w-full max-w-[280px] transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative aspect-square w-full max-w-[192px] mb-8 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#C5A059] transition-all duration-500 bg-white/5 shadow-2xl group-hover:shadow-[0_20px_50px_rgba(197,160,89,0.3)]">
        <img 
          src={speaker.image} 
          alt={speaker.name} 
          className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="w-full px-4">
        <h4 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#C5A059] transition-colors line-clamp-2">
          {speaker.name}
        </h4>
        <div className="text-white/50 text-xs font-medium leading-relaxed">
          <p className="line-clamp-2 min-h-[2.5rem]">{speaker.role}</p>
          <p className="mt-2 text-[#C5A059]/70 font-semibold truncate uppercase tracking-wider text-[10px]">
            {speaker.organization}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

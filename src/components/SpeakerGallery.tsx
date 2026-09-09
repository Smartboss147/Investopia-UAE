import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimationFrame } from 'motion/react';
import { speakers } from '../data/speakers';
import { SpeakerCard } from './SpeakerCard';
import { Speaker } from '../types';

interface SpeakerRowProps {
  speakers: Speaker[];
  direction: 'left' | 'right';
}

const SpeakerRow: React.FC<SpeakerRowProps> = ({ speakers: rowSpeakers, direction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const driftSpeed = 0.5;

  const pauseInteraction = () => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const resumeInteraction = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2000); // 2 seconds delay
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    // Start in the middle of the duplicated set for immediate stability
    const { scrollWidth, clientWidth } = el;
    el.scrollLeft = (scrollWidth - clientWidth) / 2;

    const handleWheel = (e: WheelEvent) => {
      // Map vertical scroll to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        pauseInteraction();
        resumeInteraction();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  useAnimationFrame(() => {
    if (!containerRef.current || isInteracting) return;
    
    const el = containerRef.current;
    const { scrollLeft, scrollWidth } = el;
    const move = direction === 'left' ? driftSpeed : -driftSpeed;
    
    el.scrollLeft += move;

    // Standard infinite loop reset
    const oneSetWidth = scrollWidth / 2;
    if (el.scrollLeft >= oneSetWidth) {
      el.scrollLeft -= oneSetWidth;
    } else if (el.scrollLeft <= 0) {
      el.scrollLeft += oneSetWidth;
    }
  });

  // Duplicate speakers for infinite feel
  const displaySpeakers = [...rowSpeakers, ...rowSpeakers];

  return (
    <div 
      ref={containerRef}
      onMouseEnter={pauseInteraction}
      onMouseLeave={resumeInteraction}
      onTouchStart={pauseInteraction}
      onTouchEnd={resumeInteraction}
      className="flex overflow-x-auto scrollbar-hide gap-8 py-10 cursor-grab active:cursor-grabbing select-none mask-fade-edges"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {displaySpeakers.map((speaker, i) => (
        <div key={`${speaker.id}-${i}`} className="flex-none w-[280px]">
          <SpeakerCard speaker={speaker} index={i} />
        </div>
      ))}
    </div>
  );
};

export const SpeakerGallery: React.FC = () => {
  return (
    <section id="speakers" className="bg-[#000814] py-32 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h2 className="text-white text-5xl md:text-6xl font-black mb-8 leading-none tracking-tight">
              Featured <span className="text-[#C5A059]">Speakers</span>
            </h2>
            <div className="w-24 h-1 bg-[#C5A059] mb-8" />
            <p className="text-white/60 text-lg leading-relaxed">
              Investopia hosts a global community of thinkers, doers, and leaders who are redefining the boundaries of the global economic landscape.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden md:block"
          >
            <div className="text-[#C5A059] font-black text-8xl opacity-10 select-none">
              SPEAKERS
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-4">
        <SpeakerRow speakers={speakers} direction="left" />
      </div>
      
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-32 pt-20 border-t border-white/10 text-center"
        >
          <div className="inline-block px-8 py-4 border border-[#C5A059]/30 rounded-full bg-white/5 backdrop-blur-sm">
            <p className="text-gray-400 text-sm font-medium">
              Connecting world-class expertise across <span className="text-white">finance</span>, <span className="text-white">technology</span>, <span className="text-white">government</span>, and <span className="text-white">innovation</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

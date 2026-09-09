import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { recentEvents } from '../lib/investData';

export const InvestEvents: React.FC = () => {
  return (
    <section className="bg-white py-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em] mb-4">Latest Updates</h2>
            <h3 className="text-4xl md:text-5xl font-black text-[#00122e] leading-tight">
              Investopia <br />
              <span className="text-blue-600">Events & Insights</span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {recentEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white group rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className={cn(
                  "absolute top-6 left-6 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm",
                  event.category === 'Update' ? "bg-black text-white" : "bg-black text-white"
                )}>
                  {event.category === 'Update' ? 'UPDATE' : 'UPCOMING EVENT'}
                </div>
              </div>
              
              <div className="p-10 flex-grow flex flex-col">
                <h4 className="text-2xl font-black text-[#00122e] mb-4 leading-tight">
                  {event.title}
                </h4>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-3">
                  {event.description}
                </p>
                
                <div className="mt-auto">
                  <button className={cn(
                    "inline-flex items-center justify-center px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all",
                    event.category === 'Update' ? "text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                  )}>
                    اعرف المزيد
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

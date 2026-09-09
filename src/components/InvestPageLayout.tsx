import React from 'react';
import { InvestHeader } from '../components/InvestHeader';
import { InvestFooter } from '../components/InvestFooter';
import { motion } from 'motion/react';

interface InvestPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  heroImage?: string;
}

export const InvestPageLayout: React.FC<InvestPageLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  heroImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop"
}) => {
  return (
    <div className="min-h-screen bg-white">
      <InvestHeader />
      
      {title && (
        <section className="relative h-[60vh] flex items-center pt-20 overflow-hidden bg-[#00122e]">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt={title} 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#00122e]/80 to-[#00122e]" />
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl md:text-2xl text-[#C5A059] font-medium max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      <main className={title ? "relative z-10 -mt-20" : ""}>
        {children}
      </main>
      
      <InvestFooter />
    </div>
  );
};

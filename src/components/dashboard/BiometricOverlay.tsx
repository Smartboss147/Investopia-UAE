import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, ShieldCheck } from 'lucide-react';

interface BiometricOverlayProps {
  onUnlock: () => void;
}

export const BiometricOverlay: React.FC<BiometricOverlayProps> = ({ onUnlock }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const startScan = () => {
    setStatus('scanning');
    // Simulate scan delay
    setTimeout(() => {
      setStatus('success');
      // Final delay before clearing
      setTimeout(() => {
        onUnlock();
      }, 800);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#0A0F1E] flex flex-col items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative mb-12">
            <motion.div
              animate={status === 'scanning' ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.5, 1],
              } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-32 h-32 rounded-full border-2 border-[#D4FF3D]/20 flex items-center justify-center mx-auto"
            >
              {status === 'success' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[#D4FF3D]"
                >
                  <ShieldCheck size={64} strokeWidth={1.5} />
                </motion.div>
              ) : (
                <div className={status === 'scanning' ? "text-[#D4FF3D]" : "text-[#8A93A6]"}>
                  <Fingerprint size={64} strokeWidth={1.5} />
                </div>
              )}
            </motion.div>

            {status === 'scanning' && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-[#D4FF3D] shadow-[0_0_15px_#D4FF3D] z-10"
              />
            )}
          </div>

          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">
            {status === 'idle' && 'Security Required'}
            {status === 'scanning' && 'Scanning...'}
            {status === 'success' && 'Authenticated'}
          </h2>
          <p className="text-[#8A93A6] text-sm mb-12 max-w-[240px] mx-auto leading-relaxed">
            {status === 'idle' && 'Touch the sensor to verify your identity and access your portfolio.'}
            {status === 'scanning' && 'Please keep your finger on the sensor for verification.'}
            {status === 'success' && 'Identity verified. Accessing Investopia dashboard.'}
          </p>

          {status === 'idle' && (
            <button
              onClick={startScan}
              className="bg-[#D4FF3D] text-black font-black px-12 py-4 rounded-full uppercase tracking-widest text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(212,255,61,0.2)]"
            >
              Unlock Now
            </button>
          )}
        </motion.div>

        <div className="absolute bottom-12 left-0 right-0 text-center">
          <span className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-[0.3em]">Investopia Secure Node v4.2</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

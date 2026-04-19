'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStory } from '@/lib/storyContext';

export default function GlitchBanner() {
  const { ctx } = useStory();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (ctx.flags['veridian_watching'] && !dismissed) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(t);
    }
  }, [ctx.flags['veridian_watching']]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ctx.flags['veridian_watching']) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute top-14 left-3 right-3 z-[60] rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={() => { setVisible(false); setDismissed(true); }}
        >
          {/* Glitch scanlines */}
          <div className="relative bg-red-950/95 border border-red-700/60 px-4 py-3">
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.15) 2px, rgba(255,0,0,0.15) 4px)',
              }}
            />
            <div className="relative flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"/>
              <div>
                <p className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest">
                  VERIDIAN MONITORING ACTIVE
                </p>
                <p className="text-[10px] text-red-600 mt-0.5 font-mono">
                  Device under remote observation — session logged
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

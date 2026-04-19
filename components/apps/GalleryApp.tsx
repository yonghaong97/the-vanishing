'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StatusBar from '@/components/phone/StatusBar';
import story from '@/content/story.json';
import type { GalleryItem } from '@/lib/types';

const TYPE_ICON: Record<string, string> = {
  screenshot: '📱',
  document:   '📄',
  photo:      '📷',
};

interface Props {
  onBack: () => void;
}

export default function GalleryApp({ onBack }: Props) {
  const items = story.gallery.items as GalleryItem[];
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-ios-bg"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 border-b border-ios-separator">
        <button onClick={onBack} className="text-ios-blue text-[15px] p-1">← Home</button>
        <h1 className="text-[17px] font-semibold text-ios-label">Photos</h1>
        <div className="w-16"/>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        <p className="text-[11px] uppercase tracking-widest text-ios-label3 mb-3">Evidence — {items.length} items</p>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(item)}
              className="
                aspect-square rounded-xl overflow-hidden
                bg-ios-surface flex flex-col items-center justify-center
                gap-2 p-3 text-center active:opacity-70 transition-opacity
              "
            >
              <span className="text-4xl">{TYPE_ICON[item.type]}</span>
              <span className="text-[12px] text-ios-label leading-snug">{item.label}</span>
              <span className="text-[10px] text-ios-label3">{item.date}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute inset-0 bg-ios-bg flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
          >
            <StatusBar />
            <div className="flex items-center px-4 pb-3 border-b border-ios-separator">
              <button onClick={() => setSelected(null)} className="text-ios-blue text-[15px] p-1">← Back</button>
              <h2 className="flex-1 text-center text-[16px] font-semibold text-ios-label pr-12">Evidence</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5">
              {/* Evidence image placeholder */}
              <div className="aspect-[4/3] rounded-2xl bg-ios-surface flex items-center justify-center mb-5">
                <span className="text-6xl">{TYPE_ICON[selected.type]}</span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-[17px] font-semibold text-ios-label">{selected.label}</h3>
                <span className="text-[13px] text-ios-label3">{selected.date}</span>
              </div>

              <div className="rounded-xl bg-ios-surface p-4">
                <p className="text-[14px] text-ios-label2 leading-relaxed">{selected.description}</p>
              </div>

              <div className="mt-4 px-1">
                <p className="text-[11px] uppercase tracking-widest text-ios-label3 mb-1">Type</p>
                <p className="text-[14px] text-ios-label capitalize">{selected.type}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

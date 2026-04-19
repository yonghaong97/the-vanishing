'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StatusBar from '@/components/phone/StatusBar';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { GalleryItem } from '@/lib/types';

const TYPE_ICON: Record<string, string> = {
  screenshot: '📱',
  document:   '📄',
  photo:      '📷',
  corrupted:  '▓',
};

interface Props { onBack: () => void }

export default function GalleryApp({ onBack }: Props) {
  const { ctx, reconstructPhoto, applyEffects } = useStory();
  const allItems = story.gallery.items as GalleryItem[];
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [reconstructing, setReconstructing] = useState<string | null>(null);
  const [clueRevealed, setClueRevealed] = useState(false);

  const visibleItems   = allItems.filter(i => !i.hidden);
  const hiddenItems    = allItems.filter(i => i.hidden);
  const showArchive    = ctx.flags['midpoint_twist'] || ctx.flags['veridian_watching'];
  const integrity      = ctx.systemIntegrity ?? 100;

  const handleReconstruct = (item: GalleryItem) => {
    if (integrity <= 0 || ctx.reconstructedPhotos.includes(item.id)) return;
    setReconstructing(item.id);
    setTimeout(() => {
      reconstructPhoto(item.id, 20);
      setReconstructing(null);
    }, 2000);
  };

  const isReconstructed = (id: string) => ctx.reconstructedPhotos.includes(id);

  const openItem = (item: GalleryItem) => {
    if (item.type === 'corrupted' && !isReconstructed(item.id)) return;
    setClueRevealed(false);
    setSelected(item);
  };

  const isPinned = (id: string) => ctx.flags[`pinned_${id}`] ?? false;

  const togglePin = (item: GalleryItem) => {
    applyEffects([{ type: 'set_flag', flag: `pinned_${item.id}`, value: !isPinned(item.id) }]);
  };

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

      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        <p className="text-[11px] uppercase tracking-widest text-ios-label3 mb-3">
          Evidence — {visibleItems.length} items
        </p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {visibleItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => openItem(item)}
              className="aspect-square rounded-xl overflow-hidden bg-ios-surface flex flex-col items-center justify-center gap-2 p-3 text-center active:opacity-70 transition-opacity relative"
            >
              {/* Show actual image if available, else emoji */}
              {item.imagePath ? (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <img
                    src={item.imagePath}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <span className="text-[11px] text-white leading-snug font-medium line-clamp-2">{item.label}</span>
                    <span className="block text-[9px] text-white/60 mt-0.5">{item.date}</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-4xl">{TYPE_ICON[item.type]}</span>
                  <span className="text-[12px] text-ios-label leading-snug">{item.label}</span>
                  <span className="text-[10px] text-ios-label3">{item.date}</span>
                </>
              )}
              {isPinned(item.id) && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-[8px]">📌</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Hidden archive */}
        {showArchive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[11px] uppercase tracking-widest text-red-600">_ARCHIVE_DO_NOT_OPEN</p>
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"/>
            </div>
            <div className="text-[10px] text-red-800 mb-3 font-mono">
              {integrity}% system integrity remaining · each reconstruction costs 20%
            </div>
            <div className="h-1 bg-ios-surface2 rounded-full mb-4 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${integrity > 60 ? 'bg-green-600' : integrity > 30 ? 'bg-yellow-500' : 'bg-red-600'}`}
                animate={{ width: `${integrity}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {hiddenItems.map((item, i) => {
                const reconstructed = isReconstructed(item.id);
                const isThis = reconstructing === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-xl overflow-hidden bg-ios-surface border border-red-900/30 relative flex flex-col items-center justify-center gap-2 p-3 text-center"
                  >
                    {reconstructed ? (
                      <button onClick={() => openItem(item)} className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 active:opacity-70">
                        <span className="text-3xl">📷</span>
                        <span className="text-[11px] text-green-400 leading-snug">{item.label}</span>
                        <span className="text-[10px] text-ios-label3">{item.date}</span>
                      </button>
                    ) : isThis ? (
                      <>
                        <div className="text-[24px] font-mono text-red-700 animate-pulse">▓▒░</div>
                        <p className="text-[10px] text-red-700 font-mono">Reconstructing...</p>
                        <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-red-900 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-red-600" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2, ease: 'linear' }}/>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-[24px] font-mono text-red-900">▓▒░▒▓</div>
                        <span className="text-[10px] text-red-800 font-mono">{item.label}</span>
                        <button
                          onClick={() => handleReconstruct(item)}
                          disabled={integrity <= 0 || !!reconstructing}
                          className="text-[10px] font-mono text-red-500 border border-red-800 rounded-lg px-2 py-0.5 mt-1 active:bg-red-950 disabled:opacity-30"
                        >
                          RECONSTRUCT
                        </button>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
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
              {/* Photo display */}
              <div className="aspect-[4/3] rounded-2xl bg-ios-surface flex items-center justify-center mb-5 overflow-hidden relative">
                {selected.imagePath ? (
                  <img
                    src={selected.imagePath}
                    alt={selected.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-6xl fallback-icon ${selected.imagePath ? 'hidden' : ''}`}>
                  {selected.type === 'corrupted' ? '📷' : TYPE_ICON[selected.type]}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-[17px] font-semibold text-ios-label">{selected.label}</h3>
                <span className="text-[13px] text-ios-label3">{selected.date}</span>
              </div>

              <div className="rounded-xl bg-ios-surface p-4 mb-4">
                <p className="text-[14px] text-ios-label2 leading-relaxed whitespace-pre-wrap">
                  {selected.type === 'corrupted' && isReconstructed(selected.id)
                    ? selected.reconstructedContent
                    : selected.description}
                </p>
              </div>

              {/* Clue reveal — only for non-corrupted items with clues */}
              {selected.clue && selected.type !== 'corrupted' && (
                <div className="mb-4">
                  {!clueRevealed ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setClueRevealed(true)}
                      className="w-full py-3 rounded-xl border border-amber-500/40 bg-amber-950/20 text-[13px] text-amber-400 font-mono"
                    >
                      🔍 Examine closely
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-amber-600/40 bg-amber-950/20 p-4"
                    >
                      <p className="text-[11px] font-mono text-amber-500 uppercase tracking-widest mb-2">
                        🔍 {selected.clue.label}
                      </p>
                      <p className="text-[13px] text-amber-200/80 leading-relaxed">
                        {selected.clue.text}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Pin to Board button */}
              {!selected.hidden && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => togglePin(selected)}
                  className={`w-full py-3 rounded-xl text-[13px] font-medium mb-4 transition-colors ${
                    isPinned(selected.id)
                      ? 'bg-red-950/40 text-red-400 border border-red-700/40'
                      : 'bg-ios-surface2 text-ios-blue border border-ios-separator'
                  }`}
                >
                  {isPinned(selected.id) ? '📌 Pinned to Board — tap to unpin' : '📌 Pin to Investigation Board'}
                </motion.button>
              )}

              {selected.type === 'corrupted' && isReconstructed(selected.id) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-1 p-3 bg-red-950/30 border border-red-800/30 rounded-xl"
                >
                  <p className="text-[11px] text-red-500 font-mono uppercase tracking-wider">✓ Reconstructed from corrupted data</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import StatusBar from '@/components/phone/StatusBar';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { FileItem } from '@/lib/types';

const EXT_COLOR: Record<string, string> = {
  txt:  'bg-ios-blue',
  pdf:  'bg-ios-red',
  enc:  'bg-ios-green',
};

const EXT_LABEL: Record<string, string> = {
  txt: 'TXT',
  pdf: 'PDF',
  enc: 'ENC',
};

interface Props {
  onBack: () => void;
}

export default function FilesApp({ onBack }: Props) {
  const { ctx, applyEffects } = useStory();
  const allFiles = story.files.items as FileItem[];
  const [selected, setSelected] = useState<FileItem | null>(null);

  const handleOpen = (file: FileItem) => {
    if (!ctx.discoveredFiles.includes(file.id)) {
      applyEffects([{ type: 'discover_file', fileId: file.id }]);
    }
    setSelected(file);
  };

  const isPinned = (id: string) => ctx.flags[`pinned_${id}`] ?? false;
  const togglePin = (file: FileItem) => {
    applyEffects([{ type: 'set_flag', flag: `pinned_${file.id}`, value: !isPinned(file.id) }]);
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
        <h1 className="text-[17px] font-semibold text-ios-label">Files</h1>
        <div className="w-16"/>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        <p className="text-[11px] uppercase tracking-widest text-ios-label3 mb-3">
          On this device — {allFiles.length} files
        </p>

        <div className="flex flex-col gap-2">
          {allFiles.map((file, i) => {
            const discovered = ctx.discoveredFiles.includes(file.id);
            return (
              <motion.button
                key={file.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleOpen(file)}
                className="
                  flex items-center gap-3 p-3 rounded-xl
                  bg-ios-surface border border-ios-separator
                  active:bg-ios-surface2 transition-colors text-left
                "
              >
                {/* File type badge */}
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                  ${EXT_COLOR[file.type] ?? 'bg-ios-surface2'}
                `}>
                  <span className="text-[10px] font-bold text-white">
                    {EXT_LABEL[file.type] ?? '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ios-label truncate">{file.name}</p>
                  <p className="text-[12px] text-ios-label3 mt-0.5">{file.size} · {file.date}</p>
                </div>

                {!discovered && (
                  <div className="w-2 h-2 rounded-full bg-ios-blue shrink-0"/>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* File viewer */}
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
              <h2 className="flex-1 text-center text-[15px] font-medium text-ios-label truncate px-2">
                {selected.name}
              </h2>
              <div className="w-16"/>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${EXT_COLOR[selected.type] ?? 'bg-ios-surface2'}`}>
                  <span className="text-[11px] font-bold text-white">{EXT_LABEL[selected.type]}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-ios-label">{selected.name}</p>
                  <p className="text-[12px] text-ios-label3">{selected.size} · Modified {selected.date}</p>
                </div>
              </div>

              {/* File content */}
              <div className="bg-ios-surface rounded-xl p-4">
                <pre className="text-[13px] text-ios-label2 font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {selected.content}
                </pre>
              </div>

              {/* Pin to Board */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => togglePin(selected)}
                className={`w-full mt-4 py-3 rounded-xl text-[13px] font-medium transition-colors ${
                  isPinned(selected.id)
                    ? 'bg-red-950/40 text-red-400 border border-red-700/40'
                    : 'bg-ios-surface2 text-ios-blue border border-ios-separator'
                }`}
              >
                {isPinned(selected.id) ? '📌 Pinned to Board — tap to unpin' : '📌 Pin to Investigation Board'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

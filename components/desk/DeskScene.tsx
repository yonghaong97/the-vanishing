'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Corkboard from './Corkboard';
import { useStory } from '@/lib/storyContext';

type OnboardPhase = 'package' | 'opened' | 'note' | 'desk';

function PackageOnboarding({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<OnboardPhase>('package');
  const [showNote, setShowNote] = useState(false);

  const openPackage = () => setPhase('opened');
  const readNote = () => setShowNote(true);
  const closeNote = () => { setShowNote(false); setPhase('desk'); };

  if (phase === 'desk') {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6" style={{
      background: 'linear-gradient(180deg, #1a1208 0%, #2a1e0e 100%)',
    }}>
      {/* Scene label */}
      <p className="absolute top-5 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.2em] text-amber-200/30">
        Your Office — Morning
      </p>

      {/* Newspaper corner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-14 left-4 w-28 rounded-sm shadow-md overflow-hidden"
        style={{ background: '#f0e8d0', border: '1px solid #c8b898' }}
      >
        <div className="bg-gray-800 px-2 py-1">
          <p className="text-[8px] font-bold text-white text-center tracking-widest">TRIBUNE MEDIA</p>
        </div>
        <div className="p-2">
          <p className="text-[8px] font-bold text-gray-800 leading-tight">Journalist Alex Chen Reported Missing — 3rd Day</p>
          <div className="mt-1 h-px bg-gray-400"/>
          <p className="text-[7px] text-gray-500 mt-1">Police say no evidence of foul play. Tribune has issued a statement...</p>
        </div>
      </motion.div>

      {/* Main package area */}
      <AnimatePresence mode="wait">
        {phase === 'package' && (
          <motion.div
            key="package"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-amber-200/60 text-[13px] text-center">A package arrived this morning.<br/>No return address.</p>
            <motion.button
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={openPackage}
              className="relative"
            >
              {/* Box */}
              <div className="w-48 h-36 rounded-sm shadow-2xl flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(145deg, #c8a96e, #a07040)', border: '1px solid #7a5530' }}>
                {/* Tape cross */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-amber-200/30"/>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 bg-amber-200/30"/>
                <div className="relative z-10 text-center">
                  <p className="text-[11px] font-mono text-amber-900/80 tracking-widest">J. REYES</p>
                  <p className="text-[9px] text-amber-800/60 mt-0.5">NO RETURN ADDRESS</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-200/40 mt-3 text-center">tap to open</p>
            </motion.button>
          </motion.div>
        )}

        {phase === 'opened' && (
          <motion.div
            key="opened"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-5"
          >
            <p className="text-amber-200/60 text-[13px] text-center">Inside: a cracked phone and a handwritten note.</p>

            <div className="flex gap-6 items-end">
              {/* Note */}
              <motion.button
                initial={{ opacity: 0, y: 10, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: -4 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.06, rotate: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={readNote}
                className="w-24 h-28 rounded-sm shadow-lg flex flex-col items-center justify-center p-2 text-center"
                style={{ background: '#f5f0e8', border: '1px solid #d4c8a8' }}
              >
                <p className="text-[8px] font-mono text-gray-600 leading-tight">Find out what happened. Trust nobody at Tribune.</p>
                <p className="text-[8px] font-mono text-gray-500 mt-2">— A.C.</p>
                <p className="text-[7px] text-amber-600/60 mt-2 uppercase tracking-widest">read note</p>
              </motion.button>

              {/* Phone */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                className="relative w-16 h-28 rounded-xl shadow-xl overflow-hidden flex items-center justify-center"
                style={{ background: '#1a1a1a', border: '1.5px solid #333' }}
              >
                {/* Crack */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 112" fill="none">
                  <path d="M22 10 L32 30 L24 45 L40 70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-1 rounded-full bg-white/10"/>
                  <div className="w-3 h-3 rounded-full bg-white/5"/>
                </div>
                <p className="absolute bottom-1.5 text-[6px] text-white/20 uppercase tracking-widest">power on</p>
              </motion.button>
            </div>

            <p className="text-[10px] text-amber-200/30 text-center">Click the note to read it, or the phone to start.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note modal */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) closeNote(); }}
          >
            <motion.div
              className="w-full max-w-xs rounded-sm shadow-2xl p-6"
              style={{ background: '#f5f0e8', border: '1px solid #d4c8a8', fontFamily: 'Georgia, serif' }}
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: -1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              {/* Tribune letterhead */}
              <div className="border-b border-gray-300 pb-2 mb-4">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Tribune Media</p>
              </div>
              <p className="text-[15px] text-gray-800 leading-relaxed">
                Find out what happened.
              </p>
              <p className="text-[15px] text-gray-800 leading-relaxed mt-2">
                Trust nobody at Tribune.
              </p>
              <p className="text-[14px] text-gray-600 mt-6 italic">— A.C.</p>

              <button
                onClick={closeNote}
                className="mt-6 w-full text-center text-[12px] text-blue-600 py-2 border border-blue-200 rounded-lg"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DeskScene() {
  const { ctx, applyEffects } = useStory();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const packageOpened = ctx.flags['package_opened'] ?? false;

  useEffect(() => {
    setNotes(localStorage.getItem('vanishing_notes') ?? '');
  }, []);

  const handleNotesChange = (text: string) => {
    setNotes(text);
    localStorage.setItem('vanishing_notes', text);
  };

  const handlePackageComplete = () => {
    applyEffects([{ type: 'set_flag', flag: 'package_opened', value: true }]);
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none" style={{
      background: 'linear-gradient(180deg, #1a1208 0%, #2a1e0e 100%)',
    }}>
      {/* Package onboarding — shown until package_opened flag is set */}
      <AnimatePresence>
        {!packageOpened && (
          <motion.div
            key="onboard"
            className="absolute inset-0 z-30"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PackageOnboarding onComplete={handlePackageComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal desk scene — always rendered behind onboarding */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200/30">My Desk</p>
      </div>

      {/* Corkboard */}
      <div className="relative mx-auto mt-10 rounded-xl overflow-hidden border-4 border-[#5c3d1a] shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
        style={{ width: 'min(520px, 90vw)', height: '52vh' }}>
        <Corkboard />
        <div className="absolute top-1.5 left-1.5 w-3 h-3 rounded-full bg-[#8B6914] shadow-inner z-10"/>
        <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-[#8B6914] shadow-inner z-10"/>
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 rounded-full bg-[#8B6914] shadow-inner z-10"/>
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full bg-[#8B6914] shadow-inner z-10"/>
      </div>

      {/* Desk surface */}
      <div className="flex-1 flex items-center justify-center gap-8 px-8 pt-4"
        style={{ background: 'linear-gradient(180deg, #2a1e0e 0%, #1a1208 100%)' }}>

        <div className="flex flex-col items-center gap-1 opacity-60">
          <span className="text-4xl">☕</span>
          <p className="text-[9px] uppercase tracking-widest text-amber-200/40">Cold coffee</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setNotesOpen(true)}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-20 h-24 rounded-sm shadow-lg flex flex-col overflow-hidden"
            style={{ background: '#f5f0e8', border: '1px solid #d4c8a8' }}>
            <div className="h-4 bg-[#e8dfcc] flex items-center justify-around px-2 border-b border-[#c8b898]">
              {Array.from({length: 5}).map((_,i) => (
                <div key={i} className="w-2 h-2 rounded-full border border-gray-400 bg-white/60"/>
              ))}
            </div>
            <div className="flex-1 p-2 flex flex-col gap-1.5">
              {Array.from({length: 5}).map((_,i) => (
                <div key={i} className="h-px bg-blue-200/60"/>
              ))}
            </div>
          </div>
          <p className="text-[9px] uppercase tracking-widest text-amber-200/40">Journal</p>
        </motion.button>

        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="w-2 h-20 rounded-full bg-gradient-to-b from-red-600 to-red-800 shadow-md"/>
          <p className="text-[9px] uppercase tracking-widest text-amber-200/40">Pen</p>
        </div>
      </div>

      {/* Notes/Journal modal */}
      <AnimatePresence>
        {notesOpen && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setNotesOpen(false); }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: '#f5f0e8', maxHeight: '70vh' }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200"
                style={{ background: '#e8dfcc' }}>
                <h2 className="text-[15px] font-semibold text-gray-700">Investigation Journal</h2>
                <button onClick={() => setNotesOpen(false)}
                  className="text-[13px] text-blue-600 font-medium px-2 py-1">Done</button>
              </div>
              <textarea
                className="w-full p-4 text-[14px] text-gray-800 leading-7 resize-none outline-none"
                style={{
                  background: 'repeating-linear-gradient(transparent, transparent 27px, #93c5fd40 27px, #93c5fd40 28px)',
                  minHeight: '300px',
                  fontFamily: 'Georgia, serif',
                }}
                placeholder="Write your investigation notes here..."
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                autoFocus
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

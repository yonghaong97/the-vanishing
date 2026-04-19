'use client';

/**
 * PhoneShell — the outermost phone hardware frame.
 *
 * Manages the top-level navigation stack:
 *   lock → home → app
 *
 * Framer Motion AnimatePresence handles enter/exit transitions between layers.
 */

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LockScreen from './LockScreen';
import HomeScreen from './HomeScreen';
import ChatApp      from '@/components/apps/ChatApp';
import GalleryApp   from '@/components/apps/GalleryApp';
import FilesApp     from '@/components/apps/FilesApp';
import CallTraceApp from '@/components/apps/CallTraceApp';
import RecoveryApp  from '@/components/apps/RecoveryApp';
import GlitchBanner from '@/components/ui/GlitchBanner';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { Contact } from '@/lib/types';

type Screen = 'lock' | 'home' | 'app';

const APP_COMPONENTS: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  chat:       ChatApp,
  gallery:    GalleryApp,
  files:      FilesApp,
  call_trace: CallTraceApp,
  recovery:   RecoveryApp,
};

export default function PhoneShell() {
  const { ctx, resetStory } = useStory();
  const [screen, setScreen] = useState<Screen>('lock');
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [bannerContact, setBannerContact] = useState<Contact | null>(null);
  const prevUnlockedCount = useRef(ctx.unlockedContacts.length);

  // Show notification banner when a new contact unlocks
  useEffect(() => {
    const prev = prevUnlockedCount.current;
    const curr = ctx.unlockedContacts.length;
    if (curr > prev) {
      const newContactId = ctx.unlockedContacts[curr - 1];
      const contact = (story.contacts as Record<string, Contact>)[newContactId];
      if (contact) {
        setBannerContact(contact);
        const t = setTimeout(() => setBannerContact(null), 3000);
        prevUnlockedCount.current = curr;
        return () => clearTimeout(t);
      }
    }
    prevUnlockedCount.current = curr;
  }, [ctx.unlockedContacts]);

  const handleUnlock = () => setScreen('home');

  const handleOpenApp = (appId: string) => {
    setActiveApp(appId);
    setScreen('app');
  };

  const handleBack = () => {
    setActiveApp(null);
    setScreen('home');
  };

  const ActiveApp = activeApp ? APP_COMPONENTS[activeApp] : null;

  return (
    <div className="relative flex flex-col items-center">
      {/* Phone hardware outer bezel */}
      <div
        className="
          relative w-[390px] h-[min(760px,90vh)] rounded-phone bg-[#1a1a1a]
          shadow-[0_0_0_1.5px_#3a3a3a,0_25px_80px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.06)]
          overflow-hidden select-none
        "
      >
        {/* Side buttons (decorative) */}
        <div className="absolute -left-[3px] top-[168px] w-[3px] h-[34px] bg-[#2a2a2a] rounded-l-sm"/>
        <div className="absolute -left-[3px] top-[214px] w-[3px] h-[66px] bg-[#2a2a2a] rounded-l-sm"/>
        <div className="absolute -left-[3px] top-[292px] w-[3px] h-[66px] bg-[#2a2a2a] rounded-l-sm"/>
        <div className="absolute -right-[3px] top-[220px] w-[3px] h-[88px] bg-[#2a2a2a] rounded-r-sm"/>

        {/* Screen surface */}
        <div className="absolute inset-0 rounded-phone overflow-hidden bg-ios-bg">

          {/* Dynamic Island notch */}
          <div className="
            absolute top-3 left-1/2 -translate-x-1/2 z-50
            w-[120px] h-[34px] rounded-full bg-black
            shadow-[0_0_0_1px_rgba(255,255,255,0.06)]
          "/>

          {/* New contact notification banner */}
          <AnimatePresence>
            {bannerContact && (
              <motion.div
                className="absolute top-14 left-3 right-3 z-50 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div className="bg-ios-surface/90 backdrop-blur-xl border border-ios-separator px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold shrink-0"
                    style={{ background: bannerContact.color }}
                  >
                    {bannerContact.initials}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-ios-label">{bannerContact.name}</p>
                    <p className="text-[12px] text-ios-label3">New message</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Veridian monitoring glitch banner */}
          <GlitchBanner />

          {/* Screen layers — AnimatePresence for transitions */}
          <AnimatePresence mode="wait">
            {/* Remote lock — overrides everything */}
            {ctx.flags['remote_locked'] && (
              <motion.div
                key="remote-lock"
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center px-8">
                  <p className="text-[13px] font-mono text-white/30 uppercase tracking-widest mb-8">This device has been remotely secured by its owner.</p>
                  <div className="text-[64px] font-extralight text-white/80 leading-none mb-2">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                  <p className="text-[14px] text-white/30 mt-4">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mt-10 bg-white/8 rounded-2xl px-4 py-3 border border-white/10 text-left"
                  >
                    <p className="text-[12px] font-semibold text-white/60">Alex Chen</p>
                    <p className="text-[13px] text-white/40 mt-0.5">You were never just a player.</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {!ctx.flags['remote_locked'] && screen === 'lock' && (
              <LockScreen key="lock" onUnlock={handleUnlock} />
            )}
            {!ctx.flags['remote_locked'] && screen === 'home' && !activeApp && (
              <HomeScreen key="home" onOpenApp={handleOpenApp} />
            )}
            {!ctx.flags['remote_locked'] && screen === 'app' && ActiveApp && (
              <motion.div
                key={activeApp}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                <ActiveApp onBack={handleBack} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glass shine overlay */}
          <div className="absolute inset-0 rounded-phone pointer-events-none phone-shine"/>
        </div>
      </div>

      {/* Dev controls — hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={resetStory}
          className="mt-4 text-[11px] text-white/20 hover:text-white/50 transition-colors"
        >
          reset story
        </button>
      )}
    </div>
  );
}

'use client';

/**
 * PhoneShell — the outermost phone hardware frame.
 *
 * Manages the top-level navigation stack:
 *   lock → home → app
 *
 * Framer Motion AnimatePresence handles enter/exit transitions between layers.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LockScreen from './LockScreen';
import HomeScreen from './HomeScreen';
import ChatApp    from '@/components/apps/ChatApp';
import GalleryApp from '@/components/apps/GalleryApp';
import FilesApp   from '@/components/apps/FilesApp';
import { useStory } from '@/lib/storyContext';

type Screen = 'lock' | 'home' | 'app';

const APP_COMPONENTS: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  chat:    ChatApp,
  gallery: GalleryApp,
  files:   FilesApp,
};

export default function PhoneShell() {
  const { resetStory } = useStory();
  const [screen, setScreen] = useState<Screen>('lock');
  const [activeApp, setActiveApp] = useState<string | null>(null);

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
          relative w-[390px] h-[844px] rounded-phone bg-[#1a1a1a]
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

          {/* Screen layers — AnimatePresence for transitions */}
          <AnimatePresence mode="wait">
            {screen === 'lock' && (
              <LockScreen key="lock" onUnlock={handleUnlock} />
            )}
            {screen === 'home' && !activeApp && (
              <HomeScreen key="home" onOpenApp={handleOpenApp} />
            )}
            {screen === 'app' && ActiveApp && (
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

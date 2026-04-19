'use client';
import { motion } from 'framer-motion';
import { useClock } from '@/hooks/useClock';

interface Props {
  onUnlock: () => void;
}

/** iOS-style lock screen with the game intro copy. */
export default function LockScreen({ onUnlock }: Props) {
  const time = useClock();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      className="
        absolute inset-0 flex flex-col items-center
        bg-gradient-to-b from-[#0d0d14] via-[#0a0a10] to-[#060608]
        cursor-pointer select-none z-20
      "
      onClick={onUnlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Status bar */}
      <div className="flex w-full items-center justify-between px-6 pt-3 pb-0 text-white">
        <span className="text-[15px] font-semibold">{time}</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <svg viewBox="0 0 17 12" fill="white" className="w-[17px] h-3">
            <rect x="0" y="9" width="3" height="3" rx="0.5"/>
            <rect x="4" y="6" width="3" height="6" rx="0.5"/>
            <rect x="8" y="3" width="3" height="9" rx="0.5"/>
            <rect x="12" y="0" width="3" height="12" rx="0.5"/>
          </svg>
          <div className="relative w-[25px] h-[12px] rounded-[3px] border border-white">
            <div className="absolute inset-0.5 bg-white rounded-[2px]" style={{ width: '72%' }}/>
          </div>
        </div>
      </div>

      {/* Time + date */}
      <div className="mt-8 text-center text-white">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/30 mb-3">This isn&apos;t your phone.</p>
        <div className="text-[80px] font-extralight tracking-tight leading-none">{time}</div>
        <div className="mt-2 text-[17px] font-light opacity-80">{date}</div>
      </div>

      {/* Notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="
          mt-12 mx-5 w-[calc(100%-2.5rem)]
          bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3.5
          border border-white/10
        "
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-6 h-6 rounded-md bg-ios-green flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
            </svg>
          </div>
          <span className="text-[13px] font-medium text-white">Messages</span>
          <span className="ml-auto text-[12px] text-white/50">now</span>
        </div>
        <p className="text-[14px] font-semibold text-white">Jordan K.</p>
        <p className="text-[13px] text-white/70">Alex? Hey, where are you…</p>
      </motion.div>

      {/* Swipe hint */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 text-white/50 text-[13px] text-center"
      >
        <div className="mb-1 text-[20px]">↑</div>
        tap to unlock
      </motion.div>

      {/* Cracked screen texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px
          )`
        }}
      />
    </motion.div>
  );
}

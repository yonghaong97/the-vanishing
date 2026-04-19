'use client';
import { motion } from 'framer-motion';

interface Props {
  icon: string;
  label: string;
  locked?: boolean;
  onClick: () => void;
}

const icons: Record<string, React.ReactNode> = {
  chat: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM5 16l4-4 3 3 3-4 4 5H5Z"/>
    </svg>
  ),
  files: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z"/>
    </svg>
  ),
  trace: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="11" cy="11" r="3"/>
      <line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="3" x2="11" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="21" x2="11" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="11" x2="1" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  recovery: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M12 2a10 10 0 0 0-7.35 16.76L3 21h4.5A10 10 0 1 0 12 2Zm0 18a8 8 0 1 1 4.9-14.37L14 8h6V2l-2.1 2.1A9.96 9.96 0 0 0 12 2Z" opacity="0.3"/>
      <path d="M12 4a8 8 0 0 0-5.66 13.66L4 20h4a8 8 0 1 0 4-14.93V4ZM13 12l-4-4v3H5v2h4v3l4-4Z"/>
    </svg>
  ),
};

const iconBg: Record<string, string> = {
  chat:     'bg-ios-green',
  gallery:  'bg-ios-indigo',
  files:    'bg-amber-600',
  trace:    'bg-red-700',
  recovery: 'bg-slate-600',
};

export default function AppIcon({ icon, label, locked, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={locked}
      className="flex flex-col items-center gap-1.5 select-none"
    >
      <div className={`
        relative w-[60px] h-[60px] rounded-[16px] flex items-center justify-center
        ${locked ? 'bg-ios-surface2 opacity-40' : iconBg[icon] ?? 'bg-ios-surface2'}
        shadow-md
      `}>
        <span className={locked ? 'text-ios-label3' : 'text-white'}>
          {icons[icon] ?? <span className="text-2xl">?</span>}
        </span>
        {locked && (
          <div className="absolute bottom-0.5 right-0.5 bg-ios-surface3 rounded-full p-0.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-ios-label3">
              <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-5 8.5a1.5 1.5 0 1 1-3 0V15a1.5 1.5 0 1 1 3 0v1.5ZM15 8H9V6a3 3 0 0 1 6 0v2Z"/>
            </svg>
          </div>
        )}
      </div>
      <span className="text-[11px] text-ios-label text-center leading-tight">{label}</span>
    </motion.button>
  );
}

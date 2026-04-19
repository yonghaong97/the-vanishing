'use client';
import { motion } from 'framer-motion';
import type { StoryMessage } from '@/lib/types';

interface Props {
  message: StoryMessage;
  isLast?: boolean;
  contactColor?: string;
  contactInitials?: string;
}

export default function MessageBubble({ message, isLast, contactColor, contactInitials }: Props) {
  const isPlayer = message.sender === 'player';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className={`flex w-full gap-2 ${isPlayer ? 'justify-end' : 'justify-start'}`}
    >
      {/* Contact avatar — only shown for contact messages */}
      {!isPlayer && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold shrink-0 mt-1 self-end"
          style={{ background: contactColor ?? '#818cf8' }}
        >
          {contactInitials ?? '?'}
        </div>
      )}

      <div className="flex flex-col gap-0.5" style={{ maxWidth: '72%' }}>
        <div
          className={`
            relative rounded-bubble px-3.5 py-2.5 text-[15px] leading-[1.45]
            ${isPlayer
              ? 'bg-ios-blue text-white rounded-br-sm'
              : 'bg-ios-surface text-ios-label rounded-bl-sm'
            }
          `}
        >
          {message.text}
        </div>
        {isPlayer && isLast && (
          <p className="text-[10px] text-ios-label3 text-right px-1">Delivered ✓</p>
        )}
      </div>
    </motion.div>
  );
}

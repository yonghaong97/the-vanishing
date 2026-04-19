'use client';
import { motion } from 'framer-motion';
import type { StoryMessage } from '@/lib/types';

interface Props {
  message: StoryMessage;
  isLast?: boolean;
}

export default function MessageBubble({ message, isLast }: Props) {
  const isPlayer = message.sender === 'player';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      className={`flex w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          relative max-w-[78%] rounded-bubble px-4 py-2.5 text-[15px] leading-[1.45]
          ${isPlayer
            ? 'bg-ios-blue text-white rounded-br-sm'
            : 'bg-ios-surface text-ios-label rounded-bl-sm'
          }
        `}
      >
        {message.text}
        {/* Delivery tick for player messages */}
        {isPlayer && isLast && (
          <span className="ml-1.5 text-[11px] text-blue-200 opacity-70">✓</span>
        )}
      </div>
    </motion.div>
  );
}

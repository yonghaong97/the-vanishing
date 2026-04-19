'use client';
import { motion } from 'framer-motion';

/** Three-dot iOS-style typing indicator bubble. */
export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-1 rounded-bubble rounded-bl-sm bg-ios-surface px-4 py-3 w-fit"
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="block h-2 w-2 rounded-full bg-ios-label3 animate-[dot-bounce_1.2s_infinite_ease-in-out]"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </motion.div>
  );
}

'use client';
import { motion } from 'framer-motion';
import type { Choice } from '@/lib/types';

interface Props {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
}

export default function ChoicePanel({ choices, onChoose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="px-4 pb-3 pt-2 flex flex-col gap-2.5 border-t border-ios-separator bg-ios-bg"
    >
      <p className="text-[11px] text-ios-label3 text-center tracking-wide uppercase pt-1">
        Choose your reply
      </p>
      {choices.map((c, i) => (
        <motion.button
          key={c.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07, duration: 0.22 }}
          onClick={() => onChoose(c)}
          className="
            w-full text-left rounded-2xl bg-ios-surface2 px-4 py-3.5
            text-[14px] text-ios-blue leading-snug
            active:bg-ios-surface3 transition-colors duration-100
            border border-ios-separator/80
            shadow-sm
          "
        >
          {c.text}
        </motion.button>
      ))}
    </motion.div>
  );
}

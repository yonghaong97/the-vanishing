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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="px-4 pb-2 flex flex-col gap-2"
    >
      <p className="text-[11px] text-ios-label3 text-center mb-1 tracking-wide uppercase">
        Choose a reply
      </p>
      {choices.map((c, i) => (
        <motion.button
          key={c.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.2 }}
          onClick={() => onChoose(c)}
          className="
            w-full text-left rounded-xl bg-ios-surface2 px-4 py-3
            text-[14px] text-ios-blue leading-snug
            active:bg-ios-surface3 transition-colors duration-100
            border border-ios-separator
          "
        >
          {c.text}
        </motion.button>
      ))}
    </motion.div>
  );
}

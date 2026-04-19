'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { GalleryItem } from '@/lib/types';

interface PinnedCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  source?: string;
  x: number;
  y: number;
  rotation: number;
}

function seededRand(seed: string, index: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  h = (h ^ index) >>> 0;
  return (h % 1000) / 1000;
}

function cardPosition(id: string, total: number, i: number): { x: number; y: number; rotation: number } {
  const cols = Math.ceil(Math.sqrt(total));
  const col = i % cols;
  const row = Math.floor(i / cols);
  const baseX = (col / cols) * 78 + 4;
  const baseY = (row / Math.ceil(total / cols)) * 72 + 4;
  return {
    x: baseX + seededRand(id, 1) * 8 - 4,
    y: baseY + seededRand(id, 2) * 8 - 4,
    rotation: seededRand(id, 3) * 14 - 7,
  };
}

export default function Corkboard() {
  const { ctx } = useStory();

  const cards: PinnedCard[] = [];

  // ── Starter cards (always visible after package is opened) ──────────────────
  if (ctx.flags['package_opened']) {
    cards.push({
      id: 'starter_note',
      title: "Alex's Note",
      subtitle: '"Trust nobody at Tribune"',
      icon: '📝',
      color: '#fef9c3',
      source: 'From: Package',
      x: 0, y: 0, rotation: 0,
    });
    cards.push({
      id: 'starter_news',
      title: 'Tribune — Missing',
      subtitle: 'Alex Chen, Day 3',
      icon: '📰',
      color: '#f0e8d0',
      source: 'From: Desk',
      x: 0, y: 0, rotation: 0,
    });
    cards.push({
      id: 'starter_card',
      title: 'Alex Chen',
      subtitle: 'Tribune Media, Investigative',
      icon: '🪪',
      color: '#e0f2fe',
      source: 'From: Package',
      x: 0, y: 0, rotation: 0,
    });
  }

  // ── Player-pinned gallery items ─────────────────────────────────────────────
  const allGallery = story.gallery.items as GalleryItem[];
  allGallery.forEach(item => {
    if (ctx.flags[`pinned_${item.id}`]) {
      cards.push({
        id: `pinned_${item.id}`,
        title: item.label,
        subtitle: item.date,
        icon: item.type === 'screenshot' ? '📱' : item.type === 'document' ? '📄' : '📷',
        color: '#dbeafe',
        source: 'From: Photos',
        x: 0, y: 0, rotation: 0,
      });
    }
  });

  // ── Player-pinned file items ────────────────────────────────────────────────
  story.files.items.forEach((file: { id: string; name: string; date: string; type: string }) => {
    if (ctx.flags[`pinned_${file.id}`]) {
      cards.push({
        id: `pinned_${file.id}`,
        title: file.name,
        subtitle: file.date,
        icon: file.type === 'enc' ? '🔒' : file.type === 'pdf' ? '📄' : '📝',
        color: '#fef9c3',
        source: 'From: Files',
        x: 0, y: 0, rotation: 0,
      });
    }
  });

  // ── Story revelation cards ──────────────────────────────────────────────────
  if (ctx.flags['midpoint_twist']) {
    cards.push({
      id: 'twist',
      title: 'ALEX STAGED IT',
      subtitle: 'You were bait',
      icon: '⚠️',
      color: '#fee2e2',
      source: 'Revelation',
      x: 0, y: 0, rotation: 0,
    });
  }

  if (ctx.flags['veridian_watching']) {
    cards.push({
      id: 'watching',
      title: 'MONITORED',
      subtitle: 'Veridian active',
      icon: '👁',
      color: '#fef2f2',
      source: 'Warning',
      x: 0, y: 0, rotation: 0,
    });
  }

  if (ctx.flags['story_complete']) {
    cards.push({
      id: 'conclusion',
      title: 'ACT 1 COMPLETE',
      subtitle: 'Story filed',
      icon: '📰',
      color: '#dcfce7',
      source: 'Complete',
      x: 0, y: 0, rotation: 0,
    });
  }

  if (ctx.flags['act2_complete']) {
    cards.push({
      id: 'cliffhanger',
      title: 'MEET SIGNAL',
      subtitle: '11:00 PM — Tonight',
      icon: '📅',
      color: '#fce7f3',
      source: 'Next',
      x: 0, y: 0, rotation: 0,
    });
  }

  // Assign positions
  cards.forEach((card, i) => {
    const pos = cardPosition(card.id, cards.length, i);
    card.x = pos.x;
    card.y = pos.y;
    card.rotation = pos.rotation;
  });

  const showTutorial = ctx.flags['package_opened'] && cards.length <= 3;

  return (
    <div
      className="relative w-full h-full rounded-t-xl overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 30% 40%, #c8a97e 0%, #b8935f 40%, #a07a48 100%)',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Cork texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100,60,10,0.4) 1px, transparent 0)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Empty state — before package opened */}
      {!ctx.flags['package_opened'] && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="text-4xl opacity-40">📌</span>
          <p className="text-[12px] text-amber-900/60 uppercase tracking-widest">Investigation Board</p>
          <p className="text-[11px] text-amber-900/40 text-center px-8">Open the package on your desk to begin</p>
        </div>
      )}

      {/* Tutorial nudge */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-3 left-3 right-3 z-20 bg-amber-900/50 rounded-lg px-3 py-2 backdrop-blur-sm"
          >
            <p className="text-[10px] text-amber-100/80 text-center">
              📌 Open files or photos on Alex&apos;s phone — then &quot;Pin to Board&quot; to add evidence here
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence cards */}
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          className="absolute w-28 shadow-lg cursor-default select-none"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            rotate: card.rotation,
            backgroundColor: card.color,
            borderRadius: '2px',
            padding: '8px',
          }}
          initial={{ opacity: 0, scale: 0.7, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.08, zIndex: 10, rotate: 0 }}
        >
          {/* Pushpin */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-600 shadow-md" />
          <div className="pt-1">
            <span className="text-xl block text-center mb-1">{card.icon}</span>
            <p className="text-[9px] font-bold text-gray-800 text-center leading-tight line-clamp-2">{card.title}</p>
            <p className="text-[8px] text-gray-500 text-center mt-0.5 line-clamp-1">{card.subtitle}</p>
            {card.source && (
              <p className="text-[7px] text-gray-400 text-center mt-1 uppercase tracking-wide">{card.source}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

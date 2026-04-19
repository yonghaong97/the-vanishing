'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface Page {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  pages: Page[];
  defaultPage?: number;
}

function TabIcon({ id, active }: { id: string; active: boolean }) {
  const cls = `transition-colors ${active ? 'text-white' : 'text-white/30'}`;

  if (id === 'desk') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-6 h-6 ${cls}`}>
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M2 10h20"/>
      </svg>
    );
  }
  if (id === 'found-phone') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-6 h-6 ${cls}`}>
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <path d="M12 18h.01"/>
        {/* crack line */}
        <path d="M10 6l2 3-1 2 3 3" strokeWidth={1.2} stroke={active ? '#f87171' : '#7f1d1d'} strokeLinecap="round"/>
      </svg>
    );
  }
  if (id === 'player-phone') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-6 h-6 ${cls}`}>
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <path d="M12 18h.01"/>
      </svg>
    );
  }
  return null;
}

export default function WorldLayout({ pages, defaultPage = 0 }: Props) {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    if (defaultPage > 0) {
      x.set(-defaultPage * window.innerWidth);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const snapToPage = (pageIndex: number) => {
    animate(x, -pageIndex * window.innerWidth, {
      type: 'spring',
      stiffness: 300,
      damping: 35,
    });
    setCurrentPage(pageIndex);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const width = window.innerWidth;
    const threshold = width * 0.2;
    const velocityThreshold = 500;

    let target = currentPage;
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      target = Math.min(currentPage + 1, pages.length - 1);
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      target = Math.max(currentPage - 1, 0);
    }
    snapToPage(target);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0f]" ref={containerRef}>
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a1a2e_0%,#0a0a0f_70%)]" />

      {/* Draggable page strip */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center"
        style={{ x, width: `${pages.length * 100}vw`, bottom: '56px' }}
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
      >
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-center shrink-0"
            style={{ width: '100vw', height: 'calc(100vh - 56px)' }}
          >
            {page.content}
          </div>
        ))}
      </motion.div>

      {/* Tab bar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 z-50 flex border-t border-white/10 bg-black/85 backdrop-blur-xl">
        {pages.map((page, i) => (
          <button
            key={page.id}
            onClick={() => snapToPage(i)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
          >
            <TabIcon id={page.id} active={i === currentPage} />
            <span className={`text-[10px] tracking-wide transition-colors ${i === currentPage ? 'text-white' : 'text-white/30'}`}>
              {page.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

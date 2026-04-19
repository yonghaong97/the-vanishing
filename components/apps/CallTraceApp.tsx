'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBar from '@/components/phone/StatusBar';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { Contact } from '@/lib/types';

interface TraceResult {
  number: string;
  carrier: string;
  registered: string;
  purchaseDate?: string;
  deviceStatus: string;
  lastPing: string;
  location: string;
}

interface Props { onBack: () => void }

type TraceState = 'idle' | 'tracing' | 'result';

const traceData = story.callTraceData as Record<string, TraceResult>;

export default function CallTraceApp({ onBack }: Props) {
  const { ctx, applyEffects } = useStory();
  const [selected, setSelected] = useState<string | null>(null);
  const [traceState, setTraceState] = useState<TraceState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TraceResult | null>(null);

  const traceableContacts = Object.values(story.contacts as Record<string, Contact>)
    .filter(c => ctx.unlockedContacts.includes(c.id) && traceData[c.id]);

  const runTrace = (contactId: string) => {
    if (traceState === 'tracing') return;
    setSelected(contactId);
    setTraceState('tracing');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const res = traceData[contactId];
          setResult(res);
          setTraceState('result');
          // Mark trace completed for unknown number
          if (contactId === 'unknown' && !ctx.flags['trace_completed']) {
            applyEffects([{ type: 'set_flag', flag: 'trace_completed', value: true }]);
          }
          return 100;
        }
        return p + 2;
      });
    }, 100);
  };

  const reset = () => {
    setTraceState('idle');
    setSelected(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: '#0a0a0f' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 border-b border-red-900/40">
        <button onClick={onBack} className="text-red-400 text-[15px] p-1">← Home</button>
        <h1 className="text-[17px] font-semibold text-red-300 font-mono">CALL TRACE</h1>
        <div className="w-16"/>
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,50,50,0.5) 3px, rgba(255,50,50,0.5) 4px)' }}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 relative z-0">
        <p className="text-[10px] uppercase tracking-widest text-red-700 mb-4 font-mono">
          Select a number to trace
        </p>

        {/* Contact list */}
        <div className="flex flex-col gap-2 mb-6">
          {traceableContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => runTrace(contact.id)}
              disabled={traceState === 'tracing'}
              className={`
                flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                ${selected === contact.id
                  ? 'border-red-600 bg-red-950/40'
                  : 'border-red-900/30 bg-white/[0.03] active:bg-red-950/20'}
              `}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold shrink-0"
                style={{ background: contact.color }}>
                {contact.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-red-200">{contact.name}</p>
                <p className="text-[11px] text-red-700 font-mono">{traceData[contact.id]?.number ?? 'UNKNOWN'}</p>
              </div>
              {selected === contact.id && traceState === 'tracing' && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              )}
            </button>
          ))}
        </div>

        {/* Trace progress */}
        <AnimatePresence>
          {traceState === 'tracing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 mb-4"
            >
              <p className="text-[11px] font-mono text-red-400 mb-2 uppercase tracking-widest">Tracing...</p>
              <div className="h-1.5 bg-red-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-600 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="mt-2 text-[10px] font-mono text-red-700 space-y-0.5">
                {progress > 20 && <p>→ Querying carrier database...</p>}
                {progress > 45 && <p>→ Cross-referencing registration records...</p>}
                {progress > 70 && <p>→ Pinging last known location...</p>}
                {progress > 90 && <p>→ Compiling report...</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {traceState === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-700/50 bg-red-950/30 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-mono font-bold text-red-400 uppercase tracking-widest">Trace Complete</p>
                <button onClick={reset} className="text-[11px] text-red-600 font-mono">CLEAR</button>
              </div>

              {([
                ['NUMBER',       result.number],
                ['CARRIER',      result.carrier],
                ['REGISTERED',   result.registered],
                ...(result.purchaseDate ? [['PURCHASE DATE', result.purchaseDate]] : []),
                ['DEVICE',       result.deviceStatus],
                ['LAST PING',    result.lastPing],
                ['LOCATION',     result.location],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex gap-2 py-1.5 border-b border-red-900/20 last:border-0">
                  <span className="text-[10px] font-mono text-red-700 uppercase w-24 shrink-0">{label}</span>
                  <span className="text-[11px] font-mono text-red-200 break-all">{value}</span>
                </div>
              ))}

              {selected === 'unknown' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-3 p-3 bg-red-900/30 rounded-lg border border-red-700/30"
                >
                  <p className="text-[11px] font-mono text-red-300 leading-relaxed">
                    ⚠ This device was purchased by the phone's owner before the disappearance. The contact who texted you is using Alex Chen's own burner phone.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

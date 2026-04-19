'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBar from '@/components/phone/StatusBar';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { DeletedFile, FileItem } from '@/lib/types';

interface Props { onBack: () => void }

type Tab = 'deleted' | 'encrypted';

export default function RecoveryApp({ onBack }: Props) {
  const { ctx, applyEffects } = useStory();
  const [tab, setTab] = useState<Tab>('deleted');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinState, setPinState] = useState<'idle' | 'wrong' | 'unlocked'>('idle');
  const [recovering, setRecovering] = useState<string | null>(null);

  const deletedFiles = story.deletedFiles as DeletedFile[];
  const encryptedFile = story.files.items.find(f => f.id === 'f_06') as (FileItem & { pinProtected?: boolean; pin?: string; decryptedContent?: string }) | undefined;
  const isFileDeleted = ctx.flags['files_deleted_remotely'];
  const threadUnlocked = ctx.flags['thread_unlocked'];

  const integrity = ctx.systemIntegrity ?? 100;

  const startRecovery = (fileId: string) => {
    setRecovering(fileId);
    setTimeout(() => {
      setRecovering(null);
      setExpandedId(fileId);
      applyEffects([{ type: 'set_flag', flag: `recovered_${fileId}`, value: true }]);
    }, 2500);
  };

  const tryPin = () => {
    if (pinInput === encryptedFile?.pin) {
      setPinState('unlocked');
      applyEffects([{ type: 'set_flag', flag: 'thread_unlocked', value: true }]);
    } else {
      setPinState('wrong');
      setTimeout(() => setPinState('idle'), 1200);
      setPinInput('');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: '#0d0d12' }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-700/40">
        <button onClick={onBack} className="text-slate-400 text-[15px] p-1">← Home</button>
        <h1 className="text-[17px] font-semibold text-slate-300 font-mono">RECOVERY</h1>
        <div className="w-16"/>
      </div>

      {/* System integrity bar */}
      <div className="px-4 py-2 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">System Integrity</span>
          <span className={`text-[10px] font-mono font-bold ${integrity > 60 ? 'text-green-500' : integrity > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
            {integrity}%
          </span>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${integrity > 60 ? 'bg-green-600' : integrity > 30 ? 'bg-yellow-500' : 'bg-red-600'}`}
            animate={{ width: `${integrity}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/60">
        {(['deleted', 'encrypted'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[12px] font-mono uppercase tracking-widest transition-colors ${
              tab === t ? 'text-slate-200 border-b-2 border-slate-400' : 'text-slate-600'
            }`}
          >
            {t === 'deleted' ? 'Deleted Files' : 'Encrypted Thread'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {tab === 'deleted' && (
          <div>
            {!isFileDeleted && (
              <div className="text-center mt-8">
                <p className="text-[13px] text-slate-600 font-mono">No deleted files detected.</p>
                <p className="text-[11px] text-slate-700 mt-2">Remote deletion events will appear here.</p>
              </div>
            )}

            {isFileDeleted && (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                  3 files deleted remotely — Apr 19
                </p>
                {deletedFiles.map((file, i) => {
                  const recovered = ctx.flags[`recovered_${file.id}`];
                  const isRecovering = recovering === file.id;

                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${file.recoverable ? 'bg-slate-700' : 'bg-red-950'}`}>
                          <span className="text-[11px] font-bold text-slate-300">{file.recoverable ? 'REC' : 'DEL'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-mono text-slate-300 truncate">{file.name}</p>
                          <p className={`text-[10px] font-mono ${file.recoverable ? 'text-yellow-600' : 'text-red-700'}`}>
                            {file.recoverable ? 'Partial recovery possible' : 'Unrecoverable'}
                          </p>
                        </div>
                        {file.recoverable && !recovered && (
                          <button
                            onClick={() => startRecovery(file.id)}
                            disabled={!!isRecovering || integrity <= 0}
                            className="text-[11px] font-mono text-slate-400 border border-slate-600 rounded-lg px-2 py-1 active:bg-slate-800 disabled:opacity-40"
                          >
                            {isRecovering ? '...' : 'RECOVER'}
                          </button>
                        )}
                        {recovered && (
                          <button
                            onClick={() => setExpandedId(expandedId === file.id ? null : file.id)}
                            className="text-[11px] font-mono text-green-500 border border-green-800 rounded-lg px-2 py-1"
                          >
                            VIEW
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isRecovering && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-slate-500 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2.5, ease: 'linear' }}
                              />
                            </div>
                            <p className="text-[10px] font-mono text-slate-600 mt-1">Reconstructing fragments...</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {recovered && expandedId === file.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-3 bg-black/40 rounded-lg p-3 border border-slate-700/30">
                              <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
                                {file.partialContent}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'encrypted' && (
          <div>
            {!encryptedFile && (
              <p className="text-[13px] text-slate-600 font-mono text-center mt-8">No encrypted threads found.</p>
            )}

            {encryptedFile && (
              <div className="rounded-xl border border-purple-900/40 bg-purple-950/10 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-purple-300">ENC</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-mono text-purple-200">{encryptedFile.name}</p>
                    <p className="text-[11px] text-purple-700">{encryptedFile.size} · {encryptedFile.date}</p>
                  </div>
                </div>

                {!threadUnlocked ? (
                  <div>
                    <p className="text-[12px] font-mono text-slate-400 mb-3 leading-relaxed">{encryptedFile.content}</p>
                    <p className="text-[11px] font-mono text-slate-600 mb-3">Enter 4-digit PIN to decrypt:</p>
                    <div className="flex gap-2">
                      <input
                        className={`flex-1 bg-black/40 border rounded-xl px-4 py-2.5 text-[16px] font-mono tracking-[0.3em] text-center text-slate-200 outline-none transition-colors ${
                          pinState === 'wrong' ? 'border-red-600 text-red-400' : 'border-slate-700 focus:border-purple-600'
                        }`}
                        placeholder="· · · ·"
                        maxLength={4}
                        value={pinInput}
                        onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        onKeyDown={e => e.key === 'Enter' && tryPin()}
                        inputMode="numeric"
                      />
                      <button
                        onClick={tryPin}
                        disabled={pinInput.length !== 4}
                        className="px-4 py-2.5 bg-purple-800/50 border border-purple-700/50 rounded-xl text-[13px] font-mono text-purple-300 disabled:opacity-40 active:bg-purple-700/50"
                      >
                        DECRYPT
                      </button>
                    </div>
                    {pinState === 'wrong' && (
                      <p className="text-[11px] font-mono text-red-500 mt-2">Incorrect PIN.</p>
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"/>
                      <span className="text-[11px] font-mono text-green-400 uppercase tracking-widest">Decrypted</span>
                    </div>
                    <div className="bg-black/50 rounded-xl p-4 border border-purple-900/30">
                      <pre className="text-[12px] font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                        {encryptedFile.decryptedContent}
                      </pre>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="mt-3 p-3 bg-red-950/30 border border-red-900/30 rounded-xl"
                    >
                      <p className="text-[11px] font-mono text-red-400 leading-relaxed">
                        ⚠ The disappearance was premeditated. Alex and Dana planned this together. You were the instrument — not the investigator.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

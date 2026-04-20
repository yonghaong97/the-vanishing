'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StatusBar from '@/components/phone/StatusBar';
import { useClock } from '@/hooks/useClock';
import { useStory } from '@/lib/storyContext';

type Screen = 'lock' | 'home' | 'notes' | 'messages';

interface PlayerMessage {
  sender: 'them' | 'me';
  text: string;
  delay: number;
}

// Dana's messages to the player, gated on story progress
function useDanaMessages(): PlayerMessage[] {
  const { ctx } = useStory();
  const msgs: PlayerMessage[] = [];

  if (ctx.unlockedContacts.includes('dana')) {
    msgs.push(
      { sender: 'them', text: "Hi — you're the one helping find Alex, right? Jordan gave me your number.", delay: 0 },
      { sender: 'them', text: "I can't say too much. But I work with Alex. We both found something about Veridian.", delay: 800 },
    );
  }

  if (ctx.flags['veridian_watching']) {
    msgs.push(
      { sender: 'them', text: "They know you have the phone.", delay: 1600 },
      { sender: 'them', text: "You have 20 minutes to drop it somewhere public and walk away.", delay: 2400 },
      { sender: 'them', text: "This is the only warning you're going to get.", delay: 3200 },
    );
  }

  if (ctx.flags['act2_complete']) {
    msgs.push(
      { sender: 'them', text: "The story is out. Alex is safe.", delay: 4000 },
      { sender: 'them', text: "I'm sorry for what we put you through.", delay: 4800 },
      { sender: 'them', text: "You were never supposed to be part of this.", delay: 5600 },
    );
  }

  return msgs;
}

function NotesApp({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState('');
  useEffect(() => {
    setNotes(localStorage.getItem('vanishing_notes') ?? '');
  }, []);

  const handleChange = (text: string) => {
    setNotes(text);
    localStorage.setItem('vanishing_notes', text);
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: '#f5f0e8' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200"
        style={{ background: '#e8dfcc' }}>
        <button onClick={onBack} className="text-blue-600 text-[15px]">← Back</button>
        <h1 className="text-[16px] font-semibold text-gray-700">Investigation Journal</h1>
        <div className="w-16"/>
      </div>
      <textarea
        className="flex-1 p-4 text-[14px] text-gray-800 leading-7 resize-none outline-none"
        style={{
          background: 'repeating-linear-gradient(transparent, transparent 27px, #93c5fd40 27px, #93c5fd40 28px)',
          fontFamily: 'Georgia, serif',
        }}
        placeholder="Investigation notes..."
        value={notes}
        onChange={e => handleChange(e.target.value)}
      />
    </motion.div>
  );
}

interface ChatMessage {
  sender: 'me' | 'them';
  text: string;
}

function MessagesApp({ onBack }: { onBack: () => void }) {
  const scriptedMessages = useDanaMessages();
  const [myMsg, setMyMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const allMessages: ChatMessage[] = [
    ...scriptedMessages.map(m => ({ sender: m.sender === 'me' ? 'me' as const : 'them' as const, text: m.text })),
    ...chatHistory,
  ];

  const send = async () => {
    const text = myMsg.trim();
    if (!text || isTyping) return;
    setMyMsg('');
    setChatHistory(prev => [...prev, { sender: 'me', text }]);
    setIsTyping(true);

    try {
      const apiHistory = chatHistory.map(m => ({
        role: m.sender === 'me' ? 'user' : 'assistant',
        content: m.text,
      }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: 'dana', message: text, history: apiHistory }),
      });
      const data = await res.json();
      if (data.text) {
        setChatHistory(prev => [...prev, { sender: 'them', text: data.text }]);
      }
    } catch {
      setChatHistory(prev => [...prev, { sender: 'them', text: 'no signal. try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-white"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-200">
        <button onClick={onBack} className="text-blue-600 text-[15px]">← Back</button>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-[12px] font-semibold">D</div>
          <span className="text-[12px] font-semibold text-gray-800 mt-0.5">Dana M.</span>
        </div>
        <div className="w-16"/>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-2">
        {allMessages.length === 0 && (
          <p className="text-center text-gray-400 text-[13px] mt-8">No messages yet. Progress the story to receive messages here.</p>
        )}
        {allMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i < scriptedMessages.length ? i * 0.15 : 0 }}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[72%] px-3 py-2 rounded-2xl text-[14px] leading-snug ${
              msg.sender === 'me'
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — always visible once scripted messages appear */}
      {scriptedMessages.length > 0 && (
        <div className="flex items-center gap-2 px-3 pb-4 pt-2 border-t border-gray-200">
          <input
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-[14px] text-gray-800 outline-none"
            placeholder="iMessage"
            value={myMsg}
            onChange={e => setMyMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            disabled={isTyping}
          />
          {myMsg.trim() && !isTyping && (
            <button onClick={send} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[14px]">↑</button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function PlayerLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const time = useClock();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center cursor-pointer"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)' }}
      onClick={onUnlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full items-center justify-between px-6 pt-3 text-white">
        <span className="text-[15px] font-semibold">{time}</span>
        <div className="w-[25px] h-[12px] rounded-[3px] border border-white relative">
          <div className="absolute inset-0.5 bg-white rounded-[2px]" style={{ width: '85%' }}/>
        </div>
      </div>
      <div className="mt-8 text-center text-white">
        <div className="text-[80px] font-extralight tracking-tight leading-none">{time}</div>
        <div className="mt-2 text-[17px] font-light opacity-70">{date}</div>
      </div>

      {/* Breaking news notification */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 mx-4 w-[calc(100%-2rem)] bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center">
            <span className="text-[9px] text-white font-bold">!!</span>
          </div>
          <span className="text-[12px] font-semibold text-white">BREAKING — Tribune Media</span>
        </div>
        <p className="text-[13px] text-white/80 leading-snug">
          Journalist Alex Chen, 31, missing since Tuesday. Third day with no contact. Tribune issues statement.
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-10 text-white/40 text-[13px] text-center"
      >
        <div className="mb-1 text-[20px]">↑</div>
        tap to unlock
      </motion.div>
    </motion.div>
  );
}

function PlayerHomeScreen({ onOpenApp }: { onOpenApp: (id: string) => void }) {
  const { ctx } = useStory();
  const hasDanaMsg = ctx.unlockedContacts.includes('dana');

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StatusBar transparent />
      <div className="px-6 mt-2 mb-8">
        <p className="text-[11px] uppercase tracking-widest text-white/25">Your device</p>
        <h1 className="text-[22px] font-light text-white/60 mt-0.5">My Phone</h1>
      </div>

      <div className="flex flex-wrap gap-6 px-8">
        {/* Journal */}
        <button onClick={() => onOpenApp('notes')} className="flex flex-col items-center gap-2">
          <div className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center text-3xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>📒</div>
          <span className="text-[11px] text-white/70">Journal</span>
        </button>

        {/* Messages */}
        <button onClick={() => onOpenApp('messages')} className="relative flex flex-col items-center gap-2">
          <div className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center text-3xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}>💬</div>
          {hasDanaMsg && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-[9px] text-white font-bold">1</span>
            </div>
          )}
          <span className="text-[11px] text-white/70">Messages</span>
        </button>
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="w-32 h-1 rounded-full bg-white/20"/>
      </div>
    </motion.div>
  );
}

export default function PlayerPhone() {
  const [screen, setScreen] = useState<Screen>('lock');

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="
          relative w-[360px] h-[min(700px,85vh)] rounded-[44px] bg-[#1a1a2e]
          shadow-[0_0_0_1.5px_#3a3a5a,0_25px_80px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.06)]
          overflow-hidden select-none
        "
      >
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[168px] w-[3px] h-[34px] bg-[#2a2a4a] rounded-l-sm"/>
        <div className="absolute -left-[3px] top-[214px] w-[3px] h-[66px] bg-[#2a2a4a] rounded-l-sm"/>
        <div className="absolute -right-[3px] top-[220px] w-[3px] h-[88px] bg-[#2a2a4a] rounded-r-sm"/>

        <div className="absolute inset-0 rounded-[44px] overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-[110px] h-[32px] rounded-full bg-black"/>

          <AnimatePresence mode="wait">
            {screen === 'lock' && (
              <PlayerLockScreen key="lock" onUnlock={() => setScreen('home')} />
            )}
            {screen === 'home' && (
              <PlayerHomeScreen key="home" onOpenApp={id => setScreen(id as Screen)} />
            )}
            {screen === 'notes' && (
              <NotesApp key="notes" onBack={() => setScreen('home')} />
            )}
            {screen === 'messages' && (
              <MessagesApp key="messages" onBack={() => setScreen('home')} />
            )}
          </AnimatePresence>

          <div className="absolute inset-0 rounded-[44px] pointer-events-none phone-shine"/>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-white/20 uppercase tracking-widest">Your phone</p>
    </div>
  );
}

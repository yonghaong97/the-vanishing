'use client';

/**
 * ChatApp — iMessage-style messaging interface.
 *
 * Flow:
 *   ConversationList → ConversationView
 *
 * ConversationView handles:
 *   1. Replay already-seen messages instantly (from completedNodes history)
 *   2. Queue new messages with per-message delay + typing indicator
 *   3. Show ChoicePanel when all messages are rendered
 *   4. On choice: send player message, advance machine, move to next node
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStory } from '@/lib/storyContext';
import MessageBubble from '@/components/ui/MessageBubble';
import TypingIndicator from '@/components/ui/TypingIndicator';
import ChoicePanel from '@/components/ui/ChoicePanel';
import StatusBar from '@/components/phone/StatusBar';
import story from '@/content/story.json';
import type { Choice, Contact, Conversation, StoryMessage, StoryNode } from '@/lib/types';

// ─── Types & helpers ──────────────────────────────────────────────────────────

const TYPING_DURATION = 1400; // ms per incoming message "typing" animation

function getContact(id: string): Contact {
  return (story.contacts as Record<string, Contact>)[id];
}
function getConversation(id: string): Conversation {
  return (story.conversations as Record<string, Conversation>)[id];
}
function getNode(conv: Conversation, nodeId: string): StoryNode | undefined {
  return conv.nodes[nodeId];
}

// ─── Conversation List ────────────────────────────────────────────────────────

interface ListProps {
  onBack: () => void;
  onOpen: (contactId: string) => void;
}

function ConversationList({ onBack, onOpen }: ListProps) {
  const { ctx } = useStory();
  const contacts = Object.values(story.contacts as Record<string, Contact>)
    .filter(c => ctx.unlockedContacts.includes(c.id));

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-ios-bg"
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3 border-b border-ios-separator">
        <button onClick={onBack} className="text-ios-blue text-[15px] p-1">← Home</button>
        <h1 className="text-[17px] font-semibold text-ios-label">Messages</h1>
        <div className="w-16"/>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {contacts.length === 0 && (
          <p className="text-center text-ios-label3 text-[14px] mt-8">No messages yet.</p>
        )}
        {contacts.map(contact => {
          const conv = getConversation(contact.id);
          const currentNodeId = ctx.currentNodes[contact.id] ?? conv.startNodeId;
          const node = getNode(conv, currentNodeId);
          const preview = node?.messages[0]?.text ?? '…';

          return (
            <button
              key={contact.id}
              onClick={() => onOpen(contact.id)}
              className="
                w-full flex items-center gap-3 px-4 py-3
                border-b border-ios-separator text-left
                active:bg-ios-surface transition-colors
              "
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-[16px] shrink-0"
                style={{ background: contact.color }}
              >
                {contact.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-[16px] font-semibold text-ios-label truncate">{contact.name}</span>
                  <span className="text-[13px] text-ios-label3 ml-2 shrink-0">now</span>
                </div>
                <p className="text-[14px] text-ios-label3 truncate mt-0.5">{preview}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Conversation View ────────────────────────────────────────────────────────

interface ViewProps {
  contactId: string;
  onBack: () => void;
}

function ConversationView({ contactId, onBack }: ViewProps) {
  const { ctx, completeNode, makeChoice, applyEffects } = useStory();
  const contact = getContact(contactId);
  const conv = getConversation(contactId);

  // All messages that have been rendered so far (persists across re-opens)
  const [visibleMessages, setVisibleMessages] = useState<StoryMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isChoosingLocked, setIsChoosingLocked] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentNodeId = ctx.currentNodes[contactId] ?? conv.startNodeId;

  // Rebuild message history from completedNodes + current node
  const buildHistory = useCallback((): StoryMessage[] => {
    const msgs: StoryMessage[] = [];
    // Walk the conversation tree in order to collect messages for all completed nodes
    const visited = new Set<string>();
    const walk = (nodeId: string) => {
      if (visited.has(nodeId) || !ctx.completedNodes.includes(nodeId)) return;
      visited.add(nodeId);
      const node = getNode(conv, nodeId);
      if (!node) return;
      msgs.push(...node.messages);
      // If player made a choice at this node, follow that branch
      const choiceId = ctx.choices[nodeId];
      if (choiceId && node.choices) {
        const chosen = node.choices.find(c => c.id === choiceId);
        if (chosen) walk(chosen.nextNodeId);
      } else if (node.autoAdvance?.nextNodeId) {
        walk(node.autoAdvance.nextNodeId);
      }
    };
    walk(conv.startNodeId);
    return msgs;
  }, [ctx.completedNodes, ctx.choices, conv, contactId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animate new node messages in sequence ─────────────────────────────────

  const animateNode = useCallback((node: StoryNode) => {
    setShowChoices(false);
    setIsChoosingLocked(false);
    const tids: ReturnType<typeof setTimeout>[] = [];

    node.messages.forEach((msg, i) => {
      const baseDelay = msg.delay;

      if (msg.sender === 'contact') {
        // Show typing indicator first
        tids.push(setTimeout(() => setIsTyping(true), baseDelay));
        // Then replace with message
        tids.push(setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }, baseDelay + TYPING_DURATION));
      } else {
        // Player message appears immediately (was sent)
        tids.push(setTimeout(() => {
          setVisibleMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }, baseDelay));
      }

      // After last message: apply effects + show choices or auto-advance
      if (i === node.messages.length - 1) {
        const afterDelay = baseDelay + (msg.sender === 'contact' ? TYPING_DURATION : 0) + 400;

        tids.push(setTimeout(() => {
          // Apply node-level effects
          if (node.effects?.length) applyEffects(node.effects);

          if (node.choices?.length) {
            setShowChoices(true);
          } else if (node.autoAdvance) {
            // Auto-advance to next node
            const { nextNodeId, delay: advDelay } = node.autoAdvance;
            tids.push(setTimeout(() => {
              completeNode(node.id, contactId, nextNodeId);
            }, advDelay));
          } else {
            // Terminal node — just mark complete
            completeNode(node.id, contactId);
          }
        }, afterDelay));
      }
    });

    timeoutsRef.current = tids;
  }, [applyEffects, completeNode, contactId]);

  // ── On mount / node change: replay history or animate new node ────────────

  useEffect(() => {
    // Clear any pending timeouts from previous node
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const currentNode = getNode(conv, currentNodeId);
    if (!currentNode) return;

    const isNodeCompleted = ctx.completedNodes.includes(currentNodeId);

    if (isNodeCompleted) {
      // Replay history instantly (re-opening an already-read conversation)
      setVisibleMessages(buildHistory());
      setIsTyping(false);
      // Check if we should show choices (if node is completed but was a terminal choice node — rare)
      setShowChoices(false);
    } else {
      // New node: show history up to (not including) this node, then animate
      setVisibleMessages(buildHistory());
      animateNode(currentNode);
    }

    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [currentNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages, isTyping, showChoices]);

  // ── Choice handler ────────────────────────────────────────────────────────

  const handleChoose = (choice: Choice) => {
    if (isChoosingLocked) return;
    setIsChoosingLocked(true);
    setShowChoices(false);

    // Show player message immediately
    const playerMsg: StoryMessage = {
      id: `choice_${choice.id}`,
      sender: 'player',
      text: choice.text,
      delay: 0,
    };
    setVisibleMessages(prev => [...prev, playerMsg]);

    // Advance machine (marks current node complete, moves to next)
    setTimeout(() => {
      makeChoice(currentNodeId, contactId, choice.id, choice.nextNodeId, choice.effects);
    }, 400);
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-ios-bg"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <StatusBar />
      <div className="flex items-center gap-3 px-3 pb-3 border-b border-ios-separator">
        <button onClick={onBack} className="text-ios-blue text-[15px] px-1 py-1">← Back</button>
        <div className="flex-1 flex flex-col items-center">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-semibold mb-0.5"
            style={{ background: contact.color }}
          >
            {contact.initials}
          </div>
          <span className="text-[13px] font-semibold text-ios-label">{contact.name}</span>
        </div>
        <div className="w-16"/>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 flex flex-col gap-2">
        {visibleMessages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={i === visibleMessages.length - 1}
          />
        ))}
        <AnimatePresence>
          {isTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Choice panel */}
      <AnimatePresence>
        {showChoices && (
          <ChoicePanel
            key="choices"
            choices={getNode(conv, currentNodeId)?.choices ?? []}
            onChoose={handleChoose}
          />
        )}
      </AnimatePresence>

      {/* Safe-area bottom */}
      <div className="h-4"/>
    </motion.div>
  );
}

// ─── ChatApp root ─────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

export default function ChatApp({ onBack }: Props) {
  const [activeContact, setActiveContact] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {activeContact ? (
          <ConversationView
            key={activeContact}
            contactId={activeContact}
            onBack={() => setActiveContact(null)}
          />
        ) : (
          <ConversationList
            key="list"
            onBack={onBack}
            onOpen={setActiveContact}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

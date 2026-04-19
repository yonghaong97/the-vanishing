'use client';

/**
 * StoryProvider wraps the XState machine and exposes it via React Context.
 * Automatically persists context to localStorage on every state change.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import type { Actor, SnapshotFrom } from 'xstate';
import { storyMachine, initialContext } from './storyMachine';
import { saveContext, loadContext } from './persistence';
import type { StoryEvent, StoryContext, Effect } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

type MachineActor = Actor<typeof storyMachine>;

interface StoryCtxValue {
  snapshot:       SnapshotFrom<typeof storyMachine>;
  send:           MachineActor['send'];
  /** Convenience: the current XState context */
  ctx:            StoryContext;
  /** Shorthand helpers so components don't import storyMachine directly */
  completeNode:   (nodeId: string, contactId: string, nextNodeId?: string) => void;
  makeChoice:     (nodeId: string, contactId: string, choiceId: string, nextNodeId: string, effects: Effect[]) => void;
  applyEffects:   (effects: Effect[]) => void;
  resetStory:     () => void;
}

const StoryContext = createContext<StoryCtxValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const saved = useRef(loadContext());

  const [snapshot, send] = useMachine(storyMachine, {
    input: saved.current ?? initialContext,
    // Restore context if we have a saved one
    ...(saved.current ? { snapshot: { value: 'playing', context: saved.current, status: 'active' } as never } : {}),
  });

  // Persist on every context change
  useEffect(() => {
    saveContext(snapshot.context);
  }, [snapshot.context]);

  const ctx = snapshot.context;

  const completeNode = (nodeId: string, contactId: string, nextNodeId?: string) =>
    send({ type: 'COMPLETE_NODE', nodeId, contactId, nextNodeId });

  const makeChoice = (nodeId: string, contactId: string, choiceId: string, nextNodeId: string, effects: Effect[]) =>
    send({ type: 'MAKE_CHOICE', nodeId, contactId, choiceId, nextNodeId, effects });

  const applyEffects = (effects: Effect[]) =>
    send({ type: 'APPLY_EFFECTS', effects });

  const resetStory = () => {
    send({ type: 'RESET' });
    if (typeof window !== 'undefined') localStorage.removeItem('vanishing_v1');
  };

  return (
    <StoryContext.Provider value={{ snapshot, send, ctx, completeNode, makeChoice, applyEffects, resetStory }}>
      {children}
    </StoryContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStory(): StoryCtxValue {
  const val = useContext(StoryContext);
  if (!val) throw new Error('useStory must be used inside <StoryProvider>');
  return val;
}

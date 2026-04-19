/**
 * storyMachine — XState v5 machine for The Vanishing narrative state.
 *
 * Responsibilities:
 *   - Track which story node each conversation is currently on
 *   - Record completed nodes so message history persists when re-opening chats
 *   - Apply side-effects (unlock apps, contacts, files; set story flags)
 *   - Provide a single serialisable context that can be saved to localStorage
 *
 * The machine intentionally stays in one top-level state ("playing") because
 * story branching is data-driven (JSON), not state-driven. XState handles
 * the mutation model; React handles the view logic.
 */

import { createMachine, assign } from 'xstate';
import type { StoryContext, StoryEvent, Effect } from './types';

// ─── Helper: apply a list of effects to context ───────────────────────────────

function applyEffects(ctx: StoryContext, effects: Effect[]): Partial<StoryContext> {
  const patch: Partial<StoryContext> = {};

  const appUnlocks      = effects.filter((e): e is Extract<Effect, { type: 'unlock_app' }>     => e.type === 'unlock_app');
  const contactUnlocks  = effects.filter((e): e is Extract<Effect, { type: 'unlock_contact' }> => e.type === 'unlock_contact');
  const fileDiscoveries = effects.filter((e): e is Extract<Effect, { type: 'discover_file' }>  => e.type === 'discover_file');
  const flagSets        = effects.filter((e): e is Extract<Effect, { type: 'set_flag' }>        => e.type === 'set_flag');

  if (appUnlocks.length) {
    patch.unlockedApps = [...new Set([...ctx.unlockedApps, ...appUnlocks.map(e => e.appId)])];
  }
  if (contactUnlocks.length) {
    patch.unlockedContacts = [...new Set([...ctx.unlockedContacts, ...contactUnlocks.map(e => e.contactId)])];
  }
  if (fileDiscoveries.length) {
    patch.discoveredFiles = [...new Set([...ctx.discoveredFiles, ...fileDiscoveries.map(e => e.fileId)])];
  }
  if (flagSets.length) {
    const newFlags = { ...ctx.flags };
    flagSets.forEach(e => { newFlags[e.flag] = e.value; });
    patch.flags = newFlags;
  }

  return patch;
}

// ─── Initial context (matches the story.json defaults) ───────────────────────

export const initialContext: StoryContext = {
  currentNodes:        {},
  completedNodes:      [],
  unlockedApps:        ['chat'],
  unlockedContacts:    ['jordan'],
  discoveredFiles:     [],
  flags:               {},
  choices:             {},
  readContacts:        [],
  choiceTexts:         {},
  systemIntegrity:     100,
  reconstructedPhotos: [],
};

// ─── Machine definition ───────────────────────────────────────────────────────

export const storyMachine = createMachine({
  id: 'story',
  types: {} as { context: StoryContext; events: StoryEvent; input: StoryContext },
  context: ({ input }) => ({ ...initialContext, ...input }),

  // Single top-level state — branching lives in the JSON, not in XState states.
  // We use XState here for its excellent assign() model and devtools support.
  initial: 'playing',
  states: {
    playing: {
      on: {
        /**
         * COMPLETE_NODE — fired when all messages in a node have been shown.
         * Marks the node as completed and advances currentNodes for the contact.
         * Also applies any node-level side-effects (e.g. unlocking apps).
         */
        COMPLETE_NODE: {
          actions: assign(({ context, event }) => {
            const { nodeId, contactId, nextNodeId } = event;
            const completedNodes = [...new Set([...context.completedNodes, nodeId])];
            const currentNodes = nextNodeId
              ? { ...context.currentNodes, [contactId]: nextNodeId }
              : context.currentNodes;
            return { completedNodes, currentNodes };
          }),
        },

        /**
         * MAKE_CHOICE — fired when the player taps a dialogue option.
         * Records the choice, advances the node, and applies choice effects.
         */
        MAKE_CHOICE: {
          actions: assign(({ context, event }) => {
            const { nodeId, contactId, choiceId, nextNodeId, effects, choiceText } = event;
            const choices = { ...context.choices, [nodeId]: choiceId };
            const choiceTexts = { ...context.choiceTexts, [nodeId]: choiceText };
            const currentNodes = { ...context.currentNodes, [contactId]: nextNodeId };
            const completedNodes = [...new Set([...context.completedNodes, nodeId])];
            const effectPatch = applyEffects(context, effects);
            return { choices, choiceTexts, currentNodes, completedNodes, ...effectPatch };
          }),
        },

        /**
         * APPLY_EFFECTS — generic effect application (used for node-level effects
         * that don't require a choice, e.g. unlocking gallery after reading a message).
         */
        APPLY_EFFECTS: {
          actions: assign(({ context, event }) => applyEffects(context, event.effects)),
        },

        MARK_CONTACT_READ: {
          actions: assign(({ context, event }) => ({
            readContacts: [...new Set([...context.readContacts, event.contactId])],
          })),
        },

        RECONSTRUCT_PHOTO: {
          actions: assign(({ context, event }) => ({
            reconstructedPhotos: [...new Set([...context.reconstructedPhotos, event.photoId])],
            systemIntegrity: Math.max(0, context.systemIntegrity - event.cost),
          })),
        },

        /**
         * RESET — wipe all progress (useful for dev / new-game).
         */
        RESET: {
          actions: assign(() => ({ ...initialContext })),
        },
      },
    },
  },
});

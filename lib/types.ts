// ─── Story Content Schema ────────────────────────────────────────────────────

export type MessageSender = 'contact' | 'player';

export interface StoryMessage {
  id: string;
  sender: MessageSender;
  text: string;
  /** ms after the node starts before this message begins appearing */
  delay: number;
}

export type Effect =
  | { type: 'unlock_app';      appId: string }
  | { type: 'unlock_contact';  contactId: string }
  | { type: 'discover_file';   fileId: string }
  | { type: 'set_flag';        flag: string; value: boolean };

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  effects: Effect[];
}

export interface StoryNode {
  id: string;
  messages: StoryMessage[];
  choices?: Choice[];
  /** Advance automatically after all messages shown (no player choice required) */
  autoAdvance?: { nextNodeId: string; delay: number } | null;
  /** Side-effects that fire when this node is fully rendered */
  effects?: Effect[];
}

export interface Contact {
  id: string;
  name: string;
  initials: string;
  color: string;
  unlocked: boolean;
}

export interface Conversation {
  contactId: string;
  startNodeId: string;
  nodes: Record<string, StoryNode>;
}

export interface AppDef {
  id: string;
  label: string;
  icon: string;     // icon key (mapped to SVG in AppIcon component)
  unlocked: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  type: 'screenshot' | 'document' | 'photo';
  label: string;
  description: string;
  color: string;
  date: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  content: string;
}

export interface Story {
  version: string;
  title: string;
  subtitle: string;
  apps: AppDef[];
  contacts: Record<string, Contact>;
  conversations: Record<string, Conversation>;
  gallery: { items: GalleryItem[] };
  files: { items: FileItem[] };
}

// ─── XState Machine Types ─────────────────────────────────────────────────────

export interface StoryContext {
  /** contactId → current node ID within that conversation */
  currentNodes:     Record<string, string>;
  /** All node IDs that have been fully shown to the player */
  completedNodes:   string[];
  /** App IDs the player has access to */
  unlockedApps:     string[];
  /** Contact IDs the player can open */
  unlockedContacts: string[];
  /** File IDs the player has discovered */
  discoveredFiles:  string[];
  /** Arbitrary boolean flags used for branching conditions */
  flags:            Record<string, boolean>;
  /** nodeId → choiceId the player selected */
  choices:          Record<string, string>;
}

export type StoryEvent =
  | { type: 'COMPLETE_NODE';     nodeId: string; contactId: string; nextNodeId?: string }
  | { type: 'MAKE_CHOICE';       nodeId: string; contactId: string; choiceId: string; nextNodeId: string; effects: Effect[] }
  | { type: 'APPLY_EFFECTS';     effects: Effect[] }
  | { type: 'RESET' };

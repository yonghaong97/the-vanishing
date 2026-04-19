import type { StoryContext } from './types';
import { initialContext } from './storyMachine';

const KEY = 'vanishing_v1';

export function saveContext(ctx: StoryContext): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    // storage quota exceeded or private mode — fail silently
  }
}

export function loadContext(): StoryContext | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoryContext>;
    // Merge with initialContext so any missing fields from older saves are filled in
    return { ...initialContext, ...parsed };
  } catch {
    return null;
  }
}

export function clearContext(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

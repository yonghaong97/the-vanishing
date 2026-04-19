import type { StoryContext } from './types';

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
    return raw ? (JSON.parse(raw) as StoryContext) : null;
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

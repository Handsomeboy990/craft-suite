// Which effects a trade gets. The intensity says how far they go; this says
// whether they exist at all, which is what makes a coach's page and an
// electrician's page move differently in kind rather than only in speed.

export const SIGNATURES = ['energetic', 'creative', 'crafted', 'technical', 'clinical'] as const;

export type Signature = (typeof SIGNATURES)[number];

export type Effect = 'entrance' | 'reveal' | 'stagger' | 'counters' | 'parallax' | 'lift';

const TABLE: Record<Signature, Effect[]> = {
  energetic: ['entrance', 'reveal', 'stagger', 'counters', 'parallax', 'lift'],
  creative: ['entrance', 'reveal', 'stagger', 'parallax', 'lift'],
  crafted: ['entrance', 'reveal', 'stagger', 'counters', 'lift'],
  technical: ['reveal', 'lift'],
  clinical: ['reveal'],
};

export function effectsOf(signature: string): Effect[] {
  return TABLE[(SIGNATURES as readonly string[]).includes(signature) ? (signature as Signature) : 'technical'];
}

export function has(signature: string, effect: Effect): boolean {
  return effectsOf(signature).includes(effect);
}

// The one place the client decides whether to animate at all. Everything else
// asks this, so a single answer governs the whole page.
export function motionEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const duration = getComputedStyle(document.documentElement).getPropertyValue('--motion-duration');
  return parseFloat(duration) > 0;
}

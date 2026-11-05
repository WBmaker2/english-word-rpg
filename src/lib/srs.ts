import type { CardState } from "../types";

export function newCard(wordId: number): CardState {
  return { wordId, ease: 2.5, interval: 0, due: Date.now(), reps: 0, lapses: 0 };
}

export function review(card: CardState, quality: number, now = Date.now()): CardState {
  const c = { ...card };
  if (quality < 3) {
    c.reps = 0;
    c.lapses += 1;
    c.interval = 1;
  } else {
    if (c.reps === 0) c.interval = 1;
    else if (c.reps === 1) c.interval = 6;
    else c.interval = Math.round(c.interval * c.ease);
    c.reps += 1;
  }
  c.ease = c.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (c.ease < 1.3) c.ease = 1.3;
  c.due = now + c.interval * 24 * 60 * 60 * 1000;
  return c;
}

export function isDue(card: CardState, now = Date.now()): boolean {
  return card.due <= now;
}

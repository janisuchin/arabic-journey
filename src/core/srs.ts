// SM-2 style spaced repetition. Deterministic: the caller passes "now".

export interface Card {
  id: string;
  ease: number;
  /** interval in days (0 while in learning steps) */
  interval: number;
  /** learning step index, or -1 once graduated */
  step: number;
  due: number;
  reps: number;
  lapses: number;
}

export type Grade = 'again' | 'hard' | 'good' | 'easy';

const MIN = 60_000;
const DAY = 86_400_000;
export const LEARNING_STEPS_MIN = [1, 10];
export const START_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MASTERED_DAYS = 21;

export function newCard(id: string, now: number): Card {
  return { id, ease: START_EASE, interval: 0, step: 0, due: now, reps: 0, lapses: 0 };
}

export function review(card: Card, grade: Grade, now: number): Card {
  const c = { ...card, reps: card.reps + 1 };
  if (c.step >= 0) {
    if (grade === 'again') {
      c.step = 0;
      c.due = now + LEARNING_STEPS_MIN[0] * MIN;
    } else if (grade === 'easy' || c.step + 1 >= LEARNING_STEPS_MIN.length) {
      c.step = -1;
      c.interval = grade === 'easy' ? 4 : 1;
      c.due = now + c.interval * DAY;
    } else {
      c.step += 1;
      c.due = now + LEARNING_STEPS_MIN[c.step] * MIN;
    }
    return c;
  }
  if (grade === 'again') {
    c.lapses += 1;
    c.ease = Math.max(MIN_EASE, c.ease - 0.2);
    c.step = 0;
    c.interval = 0;
    c.due = now + LEARNING_STEPS_MIN[0] * MIN;
    return c;
  }
  if (grade === 'hard') {
    c.ease = Math.max(MIN_EASE, c.ease - 0.15);
    c.interval = Math.max(1, Math.round(c.interval * 1.2));
  } else if (grade === 'good') {
    c.interval = Math.max(1, Math.round(c.interval * c.ease));
  } else {
    c.ease = c.ease + 0.15;
    c.interval = Math.max(1, Math.round(c.interval * c.ease * 1.3));
  }
  c.due = now + c.interval * DAY;
  return c;
}

export const isDue = (c: Card, now: number) => c.due <= now;
export const isMastered = (c: Card) => c.step < 0 && c.interval >= MASTERED_DAYS;

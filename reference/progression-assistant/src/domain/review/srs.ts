import type { UserState } from "../../app/state";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReviewProgress = {
  lastReviewedAt?: string;
  dueAt: string;
  ease: number;
  intervalDays: number;
  attempts: number;
  correct: number;
  consecutiveCorrect: number;
};

export function reviewCard(current: ReviewProgress | undefined, remembered: boolean, now = new Date()): ReviewProgress {
  const base = current ?? {
    dueAt: now.toISOString(),
    ease: 2,
    intervalDays: 1,
    attempts: 0,
    correct: 0,
    consecutiveCorrect: 0
  };
  const nextEase = remembered ? Math.min(3.2, base.ease + 0.15) : Math.max(1.3, base.ease - 0.25);
  const nextInterval = remembered && base.attempts > 0 ? Math.max(2, Math.round(base.intervalDays * nextEase)) : 1;

  return {
    lastReviewedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + nextInterval * DAY_MS).toISOString(),
    ease: nextEase,
    intervalDays: nextInterval,
    attempts: base.attempts + 1,
    correct: remembered ? base.correct + 1 : base.correct,
    consecutiveCorrect: remembered ? base.consecutiveCorrect + 1 : 0
  };
}

export function getDueCards(cardIds: string[], state: UserState, now = new Date()): string[] {
  const nowTime = now.getTime();

  return cardIds.filter((cardId) => {
    const progress = state.cards[cardId]?.review;
    if (!progress) return true;

    const dueTime = new Date(progress.dueAt).getTime();
    if (Number.isNaN(dueTime)) return true;

    return dueTime <= nowTime;
  });
}

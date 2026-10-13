import { z } from "zod";
import { reviewCard, type ReviewProgress } from "../domain/review/srs";

export const STORAGE_KEY = "tennis-knowledge-atlas-v2";

export type CardUserState = {
  bookmarked: boolean;
  confusing: boolean;
  mastered: boolean;
  viewedAt?: string;
  review?: ReviewProgress;
};

export type UserState = {
  version: 1;
  profile: {
    currentLevel: "2.7" | "3.0" | "3.5" | "4.0";
    targetLevel: "3.5" | "4.0";
    focusPainPoints: string[];
  };
  cards: Record<string, CardUserState>;
  drillLogs: Array<{
    id: string;
    cardId: string;
    drillId: string;
    completedAt: string;
    mode: "vr" | "real-court";
  }>;
};

const dateStringSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date string"
});

const reviewProgressSchema = z
  .object({
    lastReviewedAt: dateStringSchema.optional(),
    dueAt: dateStringSchema,
    ease: z.number(),
    intervalDays: z.number(),
    attempts: z.number().int(),
    correct: z.number().int(),
    consecutiveCorrect: z.number().int()
  })
  .strict();

const cardUserStateSchema = z
  .object({
    bookmarked: z.boolean(),
    confusing: z.boolean(),
    mastered: z.boolean(),
    viewedAt: dateStringSchema.optional(),
    review: reviewProgressSchema.optional()
  })
  .strict();

const drillLogSchema = z
  .object({
    id: z.string(),
    cardId: z.string(),
    drillId: z.string(),
    completedAt: dateStringSchema,
    mode: z.enum(["vr", "real-court"])
  })
  .strict();

const userStateSchema = z
  .object({
    version: z.literal(1),
    profile: z
      .object({
        currentLevel: z.enum(["2.7", "3.0", "3.5", "4.0"]),
        targetLevel: z.enum(["3.5", "4.0"]),
        focusPainPoints: z.array(z.string())
      })
      .strict(),
    cards: z.record(z.string(), cardUserStateSchema),
    drillLogs: z.array(drillLogSchema)
  })
  .strict();

export const defaultUserState: UserState = {
  version: 1,
  profile: {
    currentLevel: "2.7",
    targetLevel: "3.5",
    focusPainPoints: ["knowledge", "progression", "technique", "spacing", "mindset", "strength"]
  },
  cards: {},
  drillLogs: []
};

function fallbackUserState(): UserState {
  return {
    ...defaultUserState,
    profile: {
      ...defaultUserState.profile,
      focusPainPoints: [...defaultUserState.profile.focusPainPoints]
    },
    cards: {},
    drillLogs: []
  };
}

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function ensureCard(state: UserState, cardId: string): CardUserState {
  return (
    state.cards[cardId] ?? {
      bookmarked: false,
      confusing: false,
      mastered: false
    }
  );
}

function nextDrillLogId(now: Date): string {
  return globalThis.crypto?.randomUUID?.() ?? `drill-${now.getTime()}-${Math.random().toString(36).slice(2)}`;
}

export function loadUserState(): UserState {
  const storage = getStorage();
  if (!storage) return fallbackUserState();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallbackUserState();

    const result = userStateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : fallbackUserState();
  } catch {
    return fallbackUserState();
  }
}

export function parseUserStatePayload(raw: string): UserState | undefined {
  try {
    const result = userStateSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

export function saveUserState(state: UserState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Browser privacy/quota settings can block writes; local review state is best effort.
  }
}

export function markCard(
  state: UserState,
  cardId: string,
  field: "bookmarked" | "confusing" | "mastered",
  value: boolean
): UserState {
  const cardState = ensureCard(state, cardId);

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardId]: {
        ...cardState,
        [field]: value,
        viewedAt: cardState.viewedAt ?? new Date().toISOString()
      }
    }
  };
}

export function updateReviewResult(state: UserState, cardId: string, remembered: boolean, now = new Date()): UserState {
  const cardState = ensureCard(state, cardId);

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardId]: {
        ...cardState,
        review: reviewCard(cardState.review, remembered, now),
        mastered: remembered ? cardState.mastered : false,
        viewedAt: now.toISOString()
      }
    }
  };
}

export function logDrill(
  state: UserState,
  cardId: string,
  drillId: string,
  mode: "vr" | "real-court",
  now = new Date()
): UserState {
  return {
    ...state,
    drillLogs: [
      {
        id: nextDrillLogId(now),
        cardId,
        drillId,
        completedAt: now.toISOString(),
        mode
      },
      ...state.drillLogs
    ].slice(0, 200)
  };
}

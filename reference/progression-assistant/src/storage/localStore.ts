import { defaultAppState } from "../domain/defaults";
import type { AppState } from "../domain/types";
import { appStateSchema } from "./schema";

const STORAGE_KEY = "tennis-progression-state";

function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function loadState(): AppState {
  const storage = getStorage();
  if (!storage) return defaultAppState;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppState;

    const parsed = JSON.parse(raw);
    const result = appStateSchema.safeParse(migrateState(parsed));
    return result.success ? result.data : defaultAppState;
  } catch {
    return defaultAppState;
  }
}

export function saveState(state: AppState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best effort; blocked or full storage should not break the app.
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(raw: string): AppState | null {
  try {
    const parsed = JSON.parse(raw);
    const result = appStateSchema.safeParse(migrateState(parsed));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function migrateState(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const state = raw as Partial<AppState> & { version?: number };
  if (state.version === 5) return state;

  if (state.version === 4) {
    return {
      ...state,
      version: 5,
      onboardingCompletedAt: state.onboardingCompletedAt ?? new Date().toISOString()
    };
  }

  const knowledgeProgress = Object.fromEntries(
    Object.entries(state.knowledgeProgress ?? {}).map(([cardId, progress]) => [
      cardId,
      {
        ...progress,
        consecutiveCorrect: progress.consecutiveCorrect ?? 0
      }
    ])
  );

  return {
    ...defaultAppState,
    ...state,
    version: 5,
    intents: state.intents ?? [],
    knowledgeProgress,
    programProgress: state.programProgress ?? {
      startDate: new Date().toISOString(),
      completedAcceptanceTests: []
    },
    recommendationLog: state.recommendationLog ?? [],
    videoAttachments: state.videoAttachments ?? [],
    matchJournals: state.matchJournals ?? [],
    nextBookingHint: state.nextBookingHint,
    onboardingCompletedAt: state.onboardingCompletedAt ?? new Date().toISOString(),
    settings: state.settings ?? defaultAppState.settings
  };
}

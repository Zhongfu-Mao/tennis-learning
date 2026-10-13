import type { AppState, TennisSession } from "./types";

export const defaultAppState: AppState = {
  version: 5,
  profile: {
    currentLevel: "2.7",
    targetLevels: ["3.5", "4.0"],
    weeklyTennisSessions: 2,
    weeklyStrengthSessions: 2,
    schoolContext: "日本网球学校 + 自主练习",
    commonProblems: ["too_close", "late_contact", "serve_inconsistent"]
  },
  sessions: [],
  intents: [],
  knowledgeProgress: {},
  programProgress: {
    startDate: new Date().toISOString(),
    completedAcceptanceTests: []
  },
  recommendationLog: [],
  videoAttachments: [],
  matchJournals: [],
  onboardingCompletedAt: undefined,
  settings: {
    ai: {
      enabled: false,
      provider: "openai-compatible",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-5.5-mini",
      apiKey: ""
    }
  }
};

export function createSession(input: Partial<TennisSession> = {}): TennisSession {
  return {
    id: input.id ?? crypto.randomUUID(),
    date: input.date ?? new Date().toISOString(),
    sessionType: input.sessionType ?? "lesson",
    durationMinutes: input.durationMinutes ?? 90,
    energyBefore: input.energyBefore ?? 3,
    energyAfter: input.energyAfter ?? 3,
    mainProblems: input.mainProblems ?? [],
    strokeFocus: input.strokeFocus ?? "forehand",
    bestMoment: input.bestMoment ?? "",
    worstPattern: input.worstPattern ?? "",
    matchPressure: input.matchPressure ?? "none",
    bodyStatus: input.bodyStatus ?? "normal",
    nextSessionIntent: input.nextSessionIntent,
    intentId: input.intentId,
    intentCompletion: input.intentCompletion,
    videoAttachmentIds: input.videoAttachmentIds,
    matchJournalId: input.matchJournalId
  };
}

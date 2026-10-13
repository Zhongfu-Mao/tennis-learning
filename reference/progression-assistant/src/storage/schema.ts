import { z } from "zod";

const problemSchema = z.enum([
  "late_contact",
  "too_close",
  "overhit",
  "net_error",
  "long_error",
  "footwork_late",
  "serve_inconsistent",
  "opportunity_error"
]);

const matchKeyPointIssueSchema = z.enum(["double_fault", "overhit", "net_error", "passive_short", "rush"]);

export const appStateSchema = z.object({
  version: z.literal(5),
  profile: z.object({
    currentLevel: z.enum(["2.7", "3.0", "3.5", "4.0"]),
    targetLevels: z.array(z.enum(["3.5", "4.0"])),
    weeklyTennisSessions: z.number().int().min(0).max(14),
    weeklyStrengthSessions: z.number().int().min(0).max(14),
    schoolContext: z.string(),
    commonProblems: z.array(problemSchema)
  }),
  sessions: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      sessionType: z.enum(["rally", "lesson", "match", "serve_practice", "strength"]),
      durationMinutes: z.number().int().min(0),
      energyBefore: z.number().int().min(1).max(5),
      energyAfter: z.number().int().min(1).max(5),
      mainProblems: z.array(problemSchema),
      strokeFocus: z.enum(["forehand", "backhand", "serve", "return", "volley", "footwork"]),
      bestMoment: z.string(),
      worstPattern: z.string(),
      matchPressure: z.enum(["none", "low", "medium", "high"]),
      bodyStatus: z.enum(["normal", "sore", "shoulder", "knee", "ankle", "back"]),
      nextSessionIntent: z.string().optional(),
      intentId: z.string().optional(),
      intentCompletion: z.enum(["done", "partial", "missed"]).optional(),
      videoAttachmentIds: z.array(z.string()).optional(),
      matchJournalId: z.string().optional()
    })
  ),
  intents: z.array(
    z.object({
      id: z.string(),
      createdAt: z.string(),
      cue: z.string(),
      scenario: z.string(),
      status: z.enum(["pending", "done", "partial", "missed"]),
      linkedSessionId: z.string().optional()
    })
  ),
  knowledgeProgress: z.record(
    z.string(),
    z.object({
      cardId: z.string(),
      lastReviewAt: z.string().optional(),
      dueAt: z.string(),
      ease: z.number(),
      intervalDays: z.number(),
      lapses: z.number().int().min(0),
      correct: z.number().int().min(0),
      consecutiveCorrect: z.number().int().min(0),
      attempts: z.number().int().min(0)
    })
  ),
  programProgress: z.object({
    startDate: z.string(),
    completedAcceptanceTests: z.array(z.string())
  }),
  recommendationLog: z.array(
    z.object({
      cardId: z.string(),
      shownAt: z.string()
    })
  ),
  videoAttachments: z.array(
    z.object({
      id: z.string(),
      sessionId: z.string().optional(),
      createdAt: z.string(),
      name: z.string(),
      size: z.number().int().min(0),
      type: z.string(),
      note: z.string()
    })
  ),
  matchJournals: z.array(
    z.object({
      id: z.string(),
      sessionId: z.string().optional(),
      createdAt: z.string(),
      score: z.string(),
      doubleFaults: z.number().int().min(0),
      firstServeEstimate: z.number().int().min(0).max(100),
      keyPointIssues: z.array(matchKeyPointIssueSchema)
    })
  ),
  nextBookingHint: z.object({
    park: z.string(),
    startsAt: z.string(),
    source: z.enum(["manual", "court-monitor"]),
    note: z.string(),
    updatedAt: z.string()
  }).optional(),
  onboardingCompletedAt: z.string().optional(),
  settings: z.object({
    ai: z.object({
      enabled: z.boolean(),
      provider: z.literal("openai-compatible"),
      baseUrl: z.string(),
      model: z.string(),
      apiKey: z.string()
    })
  })
});

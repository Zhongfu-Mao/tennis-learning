export type SessionType = "rally" | "lesson" | "match" | "serve_practice" | "strength";

export type StrokeFocus =
  | "forehand"
  | "backhand"
  | "serve"
  | "return"
  | "volley"
  | "footwork";

export type MainProblem =
  | "late_contact"
  | "too_close"
  | "overhit"
  | "net_error"
  | "long_error"
  | "footwork_late"
  | "serve_inconsistent"
  | "opportunity_error";

export type MatchPressure = "none" | "low" | "medium" | "high";

export type BodyStatus = "normal" | "sore" | "shoulder" | "knee" | "ankle" | "back";

export type MatchKeyPointIssue =
  | "double_fault"
  | "overhit"
  | "net_error"
  | "passive_short"
  | "rush";

export type ContentCategory =
  | "knowledge_breadth"
  | "progression_route"
  | "technique_principles"
  | "spacing_footwork"
  | "match_mindset"
  | "strength_integration";

export type TennisProfile = {
  currentLevel: "2.7" | "3.0" | "3.5" | "4.0";
  targetLevels: Array<"3.5" | "4.0">;
  weeklyTennisSessions: number;
  weeklyStrengthSessions: number;
  schoolContext: string;
  commonProblems: MainProblem[];
};

export type TennisSession = {
  id: string;
  date: string;
  sessionType: SessionType;
  durationMinutes: number;
  energyBefore: number;
  energyAfter: number;
  mainProblems: MainProblem[];
  strokeFocus: StrokeFocus;
  bestMoment: string;
  worstPattern: string;
  matchPressure: MatchPressure;
  bodyStatus: BodyStatus;
  nextSessionIntent?: string;
  intentId?: string;
  intentCompletion?: "done" | "partial" | "missed";
  videoAttachmentIds?: string[];
  matchJournalId?: string;
};

export type VideoAttachment = {
  id: string;
  sessionId?: string;
  createdAt: string;
  name: string;
  size: number;
  type: string;
  note: string;
};

export type MatchJournal = {
  id: string;
  sessionId?: string;
  createdAt: string;
  score: string;
  doubleFaults: number;
  firstServeEstimate: number;
  keyPointIssues: MatchKeyPointIssue[];
};

export type CourtBookingHint = {
  park: string;
  startsAt: string;
  source: "manual" | "court-monitor";
  note: string;
  updatedAt: string;
};

export type TrainingIntent = {
  id: string;
  createdAt: string;
  cue: string;
  scenario: string;
  status: "pending" | "done" | "partial" | "missed";
  linkedSessionId?: string;
};

export type KnowledgeCardProgress = {
  cardId: string;
  lastReviewAt?: string;
  dueAt: string;
  ease: number;
  intervalDays: number;
  lapses: number;
  correct: number;
  consecutiveCorrect: number;
  attempts: number;
};

export type ProgramProgress = {
  startDate: string;
  completedAcceptanceTests: string[];
};

export type TechniqueCard = {
  id: string;
  title: string;
  category: ContentCategory;
  tags: string[];
  level: string;
  summary: string;
  principle: string;
  drill: string;
  commonMistake: string;
  diagram: "priority" | "contact" | "split" | "chain" | "serve" | "target";
};

export type RecommendationResult = {
  summary: string;
  activeFocus: ContentCategory;
  nextIntent: string;
  repeatedProblems: MainProblem[];
  cards: TechniqueCard[];
  bodyReminder?: string;
};

export type RecommendationLogEntry = {
  cardId: string;
  shownAt: string;
};

export type AiSettings = {
  enabled: boolean;
  provider: "openai-compatible";
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type AppState = {
  version: 5;
  profile: TennisProfile;
  sessions: TennisSession[];
  intents: TrainingIntent[];
  knowledgeProgress: Record<string, KnowledgeCardProgress>;
  programProgress: ProgramProgress;
  recommendationLog: RecommendationLogEntry[];
  videoAttachments: VideoAttachment[];
  matchJournals: MatchJournal[];
  nextBookingHint?: CourtBookingHint;
  onboardingCompletedAt?: string;
  settings: {
    ai: AiSettings;
  };
};

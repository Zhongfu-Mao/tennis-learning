import type { AppState, RecommendationResult } from "../domain/types";

export type CoachSummary = {
  summary: string;
  reason: string;
};

export type CoachAdapter = {
  summarize(state: AppState, recommendation: RecommendationResult): Promise<CoachSummary>;
};

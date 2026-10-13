import type { CoachAdapter } from "./adapter";

export const localCoach: CoachAdapter = {
  async summarize(_state, recommendation) {
    return {
      summary: recommendation.summary,
      reason: `推荐来自最近复盘标签和本地规则，当前主题是 ${recommendation.activeFocus}。`
    };
  }
};

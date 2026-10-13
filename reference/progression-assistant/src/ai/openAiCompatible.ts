import type { CoachAdapter } from "./adapter";

export const openAiCompatibleCoach: CoachAdapter = {
  async summarize(state, recommendation) {
    const ai = state.settings.ai;
    if (!ai.enabled || !ai.apiKey) {
      return {
        summary: recommendation.summary,
        reason: "AI 未启用，当前使用本地规则解释推荐。"
      };
    }

    const response = await fetch(`${ai.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ai.apiKey}`
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [
          {
            role: "system",
            content: "你是一个简洁的网球训练复盘助手，只输出短句，不给医疗建议。"
          },
          {
            role: "user",
            content: JSON.stringify({
              recentSession: state.sessions[0],
              recommendation
            })
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      return {
        summary: recommendation.summary,
        reason: "AI 请求失败，已回退到本地规则。"
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return {
      summary: payload.choices?.[0]?.message?.content ?? recommendation.summary,
      reason: "AI 基于最近复盘解释了本地规则推荐。"
    };
  }
};

import { findCards, techniqueCards } from "./cards";
import type { AppState, ContentCategory, MainProblem, RecommendationResult, TennisSession } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function countRecentProblems(sessions: TennisSession[], now = new Date()): Map<MainProblem, number> {
  const since = now.getTime() - 30 * DAY_MS;
  const counts = new Map<MainProblem, number>();

  sessions
    .filter((session) => new Date(session.date).getTime() >= since)
    .forEach((session) => {
      const daysAgo = Math.max(0, (now.getTime() - new Date(session.date).getTime()) / DAY_MS);
      const weight = Math.exp(-daysAgo / 14);
      session.mainProblems.forEach((problem) => {
        counts.set(problem, (counts.get(problem) ?? 0) + weight);
      });
    });

  return counts;
}

function uniqueCards(ids: string[], state?: AppState) {
  const seen = new Set<string>();
  const cooldown = new Set((state?.recommendationLog ?? []).slice(0, 9).map((item) => item.cardId));
  const mastered = new Set(
    Object.values(state?.knowledgeProgress ?? {})
      .filter((progress) => progress.correct >= 2 && progress.consecutiveCorrect >= 2)
      .map((progress) => progress.cardId)
  );
  const primary = findCards(ids).filter((card) => {
    if (seen.has(card.id)) return false;
    if (cooldown.has(card.id) || mastered.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
  if (primary.length > 0) return primary;
  return findCards(ids).filter((card) => {
    if (seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

function problemEvidence(sessions: TennisSession[], problems: MainProblem[]) {
  const labels: Record<MainProblem, string> = {
    late_contact: "击球点晚",
    too_close: "被挤到",
    overhit: "机会球打飞",
    net_error: "下网多",
    long_error: "出界多",
    footwork_late: "脚步启动晚",
    serve_inconsistent: "发球不稳定",
    opportunity_error: "机会球处理差"
  };
  const problem = problems[0];
  if (!problem) return "";
  const dates = sessions
    .filter((session) => session.mainProblems.includes(problem))
    .slice(0, 2)
    .map((session) => new Date(session.date).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }));
  if (dates.length === 0) return "";
  return ` 证据：你在 ${dates.join(" 和 ")} 都标记了“${labels[problem]}”。`;
}

export function getRecommendations(input: AppState | TennisSession[]): RecommendationResult {
  const state = Array.isArray(input) ? undefined : input;
  const sessions = Array.isArray(input) ? input : input.sessions;
  const latest = sessions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const counts = countRecentProblems(sessions);
  const repeatedProblems = Array.from(counts.entries())
    .filter(([, count]) => count >= 1.75)
    .sort((a, b) => b[1] - a[1])
    .map(([problem]) => problem);

  if (!latest) {
    return {
      summary: "先完成一次 2-3 分钟复盘，我会把当天问题收敛成下一次训练重点。",
      activeFocus: "progression_route",
      nextIntent: "下一次训练只观察一个主题：击球是否稳定过网并落到深区。",
      repeatedProblems: [],
      cards: uniqueCards(["P07", "P12", "P01"], state)
    };
  }

  const problems = new Set(latest.mainProblems);
  const hasSpacingProblem = problems.has("late_contact") || problems.has("too_close");
  let cardIds: string[] = ["P12"];
  let activeFocus: ContentCategory = "progression_route";
  let nextIntent = "下一次训练只保留一个主目标，先稳住连续性。";
  let summary = "这次复盘的重点是把问题收敛成一个可练习的动作或决策。";

  if (repeatedProblems.includes("serve_inconsistent") || problems.has("serve_inconsistent")) {
    cardIds = ["P06", "P08", "P12"];
    activeFocus = "technique_principles";
    nextIntent = "先做 5 分钟抛球窗口练习，再发二发；不要在双误后现场改动作。";
    summary = "发球波动会放大比赛压力，第一优先级是固定抛球窗口。";
  }

  if (hasSpacingProblem) {
    cardIds = ["P02", "P03", "P11", ...cardIds];
    activeFocus = "spacing_footwork";
    nextIntent = "每球在对手触球瞬间喊 split，击球前先判断自己是太近、正好还是太远。";
    summary = "被挤到通常先从空间和启动修，不急着改挥拍。";
  }

  if (problems.has("overhit") || problems.has("long_error") || problems.has("opportunity_error")) {
    cardIds = ["P01", "P08", ...cardIds];
    activeFocus = problems.has("opportunity_error") && !hasSpacingProblem ? "match_mindset" : activeFocus;
    if (!hasSpacingProblem) {
      nextIntent = problems.has("opportunity_error")
        ? "机会球先打大目标，用 70% 力量确认过网高度和落点。"
        : "把目标改成深中路，用 70% 力量先找稳定深度。";
    }
    summary = "机会球和出界问题先降风险，而不是继续加速。";
  }

  if (problems.has("net_error")) {
    cardIds = ["P01", "P05", "P09", ...cardIds];
    nextIntent = "下一次把过网高度放在第一位，先不改复杂挥拍细节。";
    summary = "下网多时，优先处理过网高度和目标区。";
  }

  if (latest.matchPressure === "high") {
    cardIds = ["P08", "P09", ...cardIds];
    activeFocus = "match_mindset";
    nextIntent = "下一场比赛只设一个战术目标：被动球打深中路，压力分不换技术动作。";
  }

  const bodyReminder =
    latest.bodyStatus === "normal"
      ? undefined
      : "身体状态有提示，下一次降低强度，把力量训练和恢复放在同一周计划里。";

  if (bodyReminder) {
    cardIds = ["P10", ...cardIds];
  }

  return {
    summary: `${summary}${problemEvidence(sessions, repeatedProblems.length ? repeatedProblems : latest.mainProblems)}`,
    activeFocus,
    nextIntent,
    repeatedProblems,
    cards: uniqueCards(cardIds.length ? cardIds : techniqueCards.slice(0, 3).map((card) => card.id), state),
    bodyReminder
  };
}

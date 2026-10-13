import matchPlaybookJson from "../../content/match-playbook.json";
import progressionJson from "../../content/progression.json";
import strengthBlocksJson from "../../content/strength-blocks.json";
import { strengthPhases, type ProgressionBlock, type StageAssessment } from "./mastery";
import type { ContentCategory, MainProblem, TennisProfile, TennisSession } from "./types";

export type { KnowledgeChapter, KnowledgeNode, KnowledgeVisual } from "./knowledge";
export { knowledgeChapters, knowledgeMap } from "./knowledge";

export type ProgressionStage = {
  id: string;
  levelBand: string;
  title: string;
  categories: ContentCategory[];
  outcomes: string[];
  weeklyFocus: string;
  blocks: ProgressionBlock[];
  assessment: StageAssessment;
};

export type MentalResetProtocol = {
  trigger: "double_fault" | "opportunity_ball" | "lead_slip" | "tight_score";
  title: string;
  steps: string[];
};

export type StrengthBlock = {
  id: string;
  title: string;
  tennisLink: string;
  movements: string[];
  caution: string;
};

export type WeeklyPlanDay = {
  day: string;
  kind: "tennis" | "strength" | "recovery" | "review";
  title: string;
  detail: string;
};

export type WeeklyPlan = {
  focus: string;
  load: "light" | "normal" | "deload";
  phase: string;
  phaseWeeks: string;
  days: WeeklyPlanDay[];
};

export function getProgressionRoadmap(): ProgressionStage[] {
  return progressionJson.stages as ProgressionStage[];
}

export const matchPlaybook = matchPlaybookJson as {
  phases: Record<"赛前" | "赛中" | "赛后", string[]>;
  resetProtocols: Array<MentalResetProtocol & { phase: "赛中" }>;
  scoreTriggers: Array<{ trigger: string; riskRule: string; bodyCue: string; target: string; phase: "赛中" }>;
};

export const mentalResetProtocols = matchPlaybook.resetProtocols;
export const strengthBlocks = strengthBlocksJson as StrengthBlock[];

function hasProblem(sessions: TennisSession[], problem: MainProblem) {
  return sessions.slice(0, 5).some((session) => session.mainProblems.includes(problem));
}

export function buildWeeklyPlan(profile: TennisProfile, sessions: TennisSession[], startDate = new Date().toISOString()): WeeklyPlan {
  const spacingFlag = hasProblem(sessions, "too_close") || hasProblem(sessions, "late_contact");
  const serveFlag = hasProblem(sessions, "serve_inconsistent");
  const pressureFlag = sessions.slice(0, 5).some((session) => session.matchPressure === "high");
  const sorenessFlag = sessions.slice(0, 3).some((session) => session.bodyStatus !== "normal");

  const focus = spacingFlag
    ? "空间感：split step、击球距离、最后两步调整"
    : serveFlag
      ? "发球稳定：抛球窗口和二发节奏"
      : pressureFlag
        ? "比赛心态：压力分只改目标和风险"
        : "稳定性：过网高度、深度和连续性";

  const load = sorenessFlag ? "deload" : profile.weeklyTennisSessions + profile.weeklyStrengthSessions >= 5 ? "normal" : "light";
  const weekNumber = Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
  const phase = phaseForWeek(weekNumber);
  const strengthMenu = phase.exercises.join("、");

  return {
    focus,
    load,
    phase: phase.phase,
    phaseWeeks: phase.weeks,
    days: [
      {
        day: "Mon",
        kind: "review",
        title: "复盘和知识卡",
        detail: "看 1 张技术卡，把本周主问题写成一句训练目标。"
      },
      {
        day: "Tue",
        kind: "strength",
        title: `力量：${phase.phase}`,
        detail: `${strengthMenu}；总量保留 2 次余力。`
      },
      {
        day: "Wed",
        kind: "tennis",
        title: "技术课/对拉",
        detail: spacingFlag ? "每球喊 split，击球前判断近/正好/远。" : "用 70% 力量打深中路连续性。"
      },
      {
        day: "Thu",
        kind: "recovery",
        title: "恢复和轻移动",
        detail: "髋踝活动度、肩胛控制、轻松步伐，不加发球量。"
      },
      {
        day: "Fri",
        kind: "strength",
        title: `力量：${phase.phase}`,
        detail: `${phase.tennisTransfer} 和发球日错开。`
      },
      {
        day: "Sat",
        kind: "tennis",
        title: "比赛/实战",
        detail: pressureFlag ? "关键分只执行一个目标区。" : "被动球先活下来，机会球大目标。"
      },
      {
        day: "Sun",
        kind: "review",
        title: "周复盘",
        detail: "检查本周主问题是否出现 3 次以上，决定下周是否继续。"
      }
    ]
  };
}

function phaseForWeek(weekNumber: number) {
  return strengthPhases.find((phase) => {
    const match = phase.weeks.match(/W(\d+)-W(\d+)/);
    if (!match) return false;
    const start = Number(match[1]);
    const end = Number(match[2]);
    return weekNumber >= start && weekNumber <= end;
  }) ?? strengthPhases[strengthPhases.length - 1];
}

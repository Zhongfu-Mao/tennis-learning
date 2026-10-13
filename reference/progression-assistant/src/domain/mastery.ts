import fatigueRulesJson from "../../content/fatigue-rules.json";
import footworkDrillsJson from "../../content/footwork-drills.json";
import matchPlaybookJson from "../../content/match-playbook.json";
import progressionBlocksJson from "../../content/progression-blocks.json";
import stageAssessmentsJson from "../../content/stage-assessments.json";
import strokesJson from "../../content/strokes.json";
import strengthPhasesJson from "../../content/strength-phases.json";
import type { BodyStatus, MainProblem } from "./types";

export type PainPointId =
  | "knowledge"
  | "progression"
  | "technique"
  | "spacing"
  | "mindset"
  | "strength";

export type PainPointCompletion = {
  id: PainPointId;
  title: string;
  status: "complete";
  proof: string[];
  nextHabit: string;
};

export type LearningMode = {
  dailyCards: number;
  reviewCadence: string[];
  quizTypes: string[];
  masteryRules: string[];
};

export type ProgressionBlock = {
  weekRange: string;
  title: string;
  tennisFocus: string;
  strengthFocus: string;
  acceptanceTest: string;
};

export type StageAssessment = {
  level: "2.7 -> 3.0" | "3.0 -> 3.5" | "3.5 -> 4.0";
  test: string;
  passStandard: string;
  commonFailure: string;
};

export type FootworkDrill = {
  id: string;
  name: string;
  problem: MainProblem;
  pattern: string;
  cue: string;
  dosage: string;
  successSignal: string;
};

export type StrengthPhase = {
  phase: string;
  weeks: string;
  goal: string;
  exercises: string[];
  tennisTransfer: string;
};

export type FatigueRule = {
  bodyStatus: BodyStatus;
  adjustment: string;
  keep: string;
  avoid: string;
};

export type TechniqueModule = {
  stroke: string;
  principle: string;
  visualFrames: string[];
  drills: string[];
  checkpoints: string[];
};

export type MatchPlaybook = {
  phase: "赛前" | "赛中" | "赛后";
  routine: string[];
};

export type ScoreTrigger = {
  trigger: string;
  riskRule: string;
  bodyCue: string;
  target: string;
};

export const painPointCompletion: PainPointCompletion[] = [
  {
    id: "knowledge",
    title: "基础认知广度和视觉记忆",
    status: "complete",
    proof: ["48 张基础知识卡", "8 个主题筛选", "视觉记忆图、关键对比、场上应用、回忆问题"],
    nextHabit: "每天 5 张卡，错题 48 小时后复看。"
  },
  {
    id: "progression",
    title: "2.7 到 3.5/4.0 的章法",
    status: "complete",
    proof: ["3 个等级阶段", "12 周训练周期", "阶段验收测试和失败模式"],
    nextHabit: "每 4 周只验收一个阶段能力，不按单次输赢判断进步。"
  },
  {
    id: "technique",
    title: "技术模块底层原理和图解",
    status: "complete",
    proof: ["8 个核心技术模块", "动作分帧视觉 cue", "练习、检查点、常见失败原因"],
    nextHabit: "每次训练只把一个技术 cue 带进场。"
  },
  {
    id: "spacing",
    title: "空间感、被挤到和步伐移动",
    status: "complete",
    proof: ["6 个步伐动作库", "来球判断顺序", "剂量、成功信号和问题映射"],
    nextHabit: "对手触球时 split，击球前喊近/正好/远。"
  },
  {
    id: "mindset",
    title: "比赛心态和比分触发策略",
    status: "complete",
    proof: ["赛前、赛中、赛后例行流程", "关键比分触发卡", "双误和机会球重置流程"],
    nextHabit: "比赛中只调整目标、力量和过网高度，不现场重建动作。"
  },
  {
    id: "strength",
    title: "力量训练和网球周期化整合",
    status: "complete",
    proof: ["4 阶段力量周期", "网球迁移目标", "疲劳和疼痛自动调档规则"],
    nextHabit: "力量训练后记录它服务的是刹车、旋转、肩胛还是抗旋。"
  }
];

export const learningMode: LearningMode = {
  dailyCards: 5,
  reviewCadence: ["当天看 5 张", "第二天回忆问题", "第 4 天复看错题", "第 7 天把 1 张卡写进训练目标"],
  quizTypes: ["看图说概念", "关键对比二选一", "场上应用填空", "错题反向提问"],
  masteryRules: ["能不用看答案说出场上应用", "连续两次答对 recall prompt", "能把知识点连到一次真实失误"]
};

export const progressionBlocks = progressionBlocksJson as ProgressionBlock[];
export const stageAssessments = stageAssessmentsJson as StageAssessment[];
export const techniqueAtlas = (strokesJson as Array<{
  stroke: string;
  principle: string;
  visualFrames: string[];
  atlasDrills: string[];
  checkpoints: string[];
}>)
  .filter((item) => item.visualFrames.length > 0)
  .map((item) => ({
    stroke: item.stroke,
    principle: item.principle,
    visualFrames: item.visualFrames,
    drills: item.atlasDrills,
    checkpoints: item.checkpoints
  }))
  .concat([
    {
      stroke: "接发",
      principle: "接发先解决进入回合，一发挡深，二发再主动。",
      visualFrames: ["对手触球 split", "小引拍", "拍面挡住来球", "回深大目标"],
      drills: ["一发挡深 20 球", "二发接大斜线", "接发后第一拍深中路"],
      checkpoints: ["是否等球过网才启动", "是否引拍过大", "是否追求一拍打死"]
    },
    {
      stroke: "截击",
      principle: "网前时间短，动作小，核心是拍面、脚步和身体前送。",
      visualFrames: ["拍头高于手", "身体向前", "脚步穿过球", "拍面送到目标"],
      drills: ["近网定点击球", "中场 approach 后截击", "低截击深中路"],
      checkpoints: ["是否大挥拍", "是否站死", "是否拍面过早打开"]
    },
    {
      stroke: "高压",
      principle: "高压像发球的移动版本，先找球下落点，再让身体到球后方。",
      visualFrames: ["侧身找球", "非持拍手指球", "小碎步到位", "向大目标扣"],
      drills: ["后退找球 10 组", "高压只打中路", "lob 后先侧身再移动"],
      checkpoints: ["是否背对不足", "是否边退边挥", "是否盯球丢失"]
    }
  ]) as TechniqueModule[];
export const footworkDrills = footworkDrillsJson as FootworkDrill[];
export const matchPlaybooks = Object.entries((matchPlaybookJson as { phases: Record<string, string[]> }).phases).map(
  ([phase, routine]) => ({ phase, routine })
) as MatchPlaybook[];
export const scoreTriggers = (matchPlaybookJson as { scoreTriggers: ScoreTrigger[] }).scoreTriggers;
export const strengthPhases = strengthPhasesJson as StrengthPhase[];
export const fatigueRules = fatigueRulesJson as FatigueRule[];

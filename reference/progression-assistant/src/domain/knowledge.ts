import knowledgeCardsJson from "../../content/knowledge-cards.json";
import knowledgeChaptersJson from "../../content/knowledge-chapters.json";
import { knowledgeNodeSchema, parseContent } from "./contentSchema";
import type { ContentCategory } from "./types";

export type KnowledgeChapter =
  | "history_rules"
  | "courts_balls"
  | "gear_strings"
  | "spin_physics"
  | "court_zones"
  | "levels_training"
  | "tactics_language"
  | "body_recovery";

export type KnowledgeVisual =
  | "timeline"
  | "scoreboard"
  | "court"
  | "ball"
  | "racket"
  | "string"
  | "spin"
  | "target"
  | "ladder"
  | "tactic"
  | "body";

export type KnowledgeNode = {
  id: string;
  title: string;
  category: ContentCategory;
  chapter: KnowledgeChapter;
  visual: KnowledgeVisual;
  memoryImage: string;
  comparison: string;
  takeaway: string;
  fieldApplication: string;
  recallPrompt: string;
  whyItMatters: string;
};

export const knowledgeChapters = knowledgeChaptersJson as Array<{ id: "all" | KnowledgeChapter; label: string }>;

export const knowledgeMap = parseContent(
  knowledgeNodeSchema.array(),
  knowledgeCardsJson,
  "content/knowledge-cards.json"
) as KnowledgeNode[];

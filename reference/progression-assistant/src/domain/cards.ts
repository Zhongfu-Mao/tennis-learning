import strokesJson from "../../content/strokes.json";
import { parseContent, strokeCardSchema } from "./contentSchema";
import type { TechniqueCard } from "./types";

export type StrokeTechniqueCard = TechniqueCard & {
  stroke: string;
  visualFrames: string[];
  checkpoints: string[];
  atlasDrills: string[];
};

export const techniqueCards = parseContent(
  strokeCardSchema.array(),
  strokesJson,
  "content/strokes.json"
) as StrokeTechniqueCard[];

export function findCards(ids: string[]): StrokeTechniqueCard[] {
  return ids
    .map((id) => techniqueCards.find((card) => card.id === id))
    .filter((card): card is StrokeTechniqueCard => Boolean(card));
}

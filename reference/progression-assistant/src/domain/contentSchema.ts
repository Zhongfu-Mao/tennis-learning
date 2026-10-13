import { z } from "zod";

const contentCategorySchema = z.enum([
  "knowledge_breadth",
  "progression_route",
  "technique_principles",
  "spacing_footwork",
  "match_mindset",
  "strength_integration"
]);

export const techniqueCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: contentCategorySchema,
  tags: z.array(z.string()),
  level: z.string(),
  summary: z.string(),
  principle: z.string(),
  drill: z.string(),
  commonMistake: z.string(),
  diagram: z.enum(["priority", "contact", "split", "chain", "serve", "target"])
});

export const strokeCardSchema = techniqueCardSchema.extend({
  stroke: z.string(),
  visualFrames: z.array(z.string()),
  checkpoints: z.array(z.string()),
  atlasDrills: z.array(z.string())
});

export const knowledgeNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: contentCategorySchema,
  chapter: z.string(),
  visual: z.string(),
  memoryImage: z.string(),
  comparison: z.string(),
  takeaway: z.string(),
  fieldApplication: z.string(),
  recallPrompt: z.string(),
  whyItMatters: z.string()
});

export function parseContent<T>(schema: z.ZodType<T>, value: unknown, name: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    console.error(`[content] ${name} failed validation`, result.error.flatten());
    return value as T;
  }
  return result.data;
}

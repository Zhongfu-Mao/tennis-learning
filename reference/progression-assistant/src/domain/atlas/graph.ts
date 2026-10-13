import type { AtlasContent } from "./content";
import type { GraphRelation, KnowledgeCard } from "./schema";

export type RelatedCard = {
  relation: GraphRelation;
  card: KnowledgeCard;
};

export function getTopicCards(content: AtlasContent, topicId: string): KnowledgeCard[] {
  return content.cards.filter((card) => card.topicIds.includes(topicId));
}

export function getCardById(content: AtlasContent, cardId: string): KnowledgeCard | undefined {
  return content.cards.find((card) => card.id === cardId);
}

export function cardImagePath(content: AtlasContent, card: KnowledgeCard): string | undefined {
  const image = content.imageManifest.find((entry) => entry.id === card.generatedImage.assetId);
  if (!image) return undefined;
  return image.status === "approved" || image.status === "candidate" ? image.path : undefined;
}

export function getRelatedCards(content: AtlasContent, cardId: string): RelatedCard[] {
  return content.relationships
    .filter((relation) => relation.sourceId === cardId)
    .map((relation) => {
      const card = getCardById(content, relation.targetId);
      return card ? { relation, card } : undefined;
    })
    .filter((item): item is RelatedCard => Boolean(item));
}

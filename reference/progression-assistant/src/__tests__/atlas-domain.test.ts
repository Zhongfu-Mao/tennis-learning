import { atlasContent } from "../domain/atlas/content";
import { getRelatedCards, getTopicCards } from "../domain/atlas/graph";
import { searchCards } from "../domain/atlas/search";

describe("atlas domain", () => {
  it("finds cards in a topic, in content order, scoped to that topic", () => {
    const cards = getTopicCards(atlasContent, "spacing-footwork");
    const ids = cards.map((card) => card.id);

    expect(ids).toEqual(expect.arrayContaining(["spacing.split-timing", "spacing.contact-distance"]));
    expect(cards.every((card) => card.topicIds.includes("spacing-footwork"))).toBe(true);
    expect(ids).not.toContain("tactics.deep-middle");
    // results preserve the order they appear in the full content list
    const contentOrder = atlasContent.cards.map((card) => card.id).filter((id) => ids.includes(id));
    expect(ids).toEqual(contentOrder);
  });

  it("finds graph-related cards from relationships json", () => {
    const related = getRelatedCards(atlasContent, "spacing.split-timing");
    const next = related.find((item) => item.card.id === "spacing.contact-distance");

    expect(next).toBeDefined();
    expect(next?.relation.type).toBe("next");
    // every related card resolves to a real card via a relation sourced at the query id
    expect(related.every((item) => item.relation.sourceId === "spacing.split-timing")).toBe(true);
  });

  it("returns no related cards for an unknown card id", () => {
    expect(getRelatedCards(atlasContent, "missing.card")).toEqual([]);
  });

  it("returns all cards in original order for an empty or whitespace query", () => {
    const allCardIds = atlasContent.cards.map((card) => card.id);

    expect(searchCards(atlasContent.cards, "").map((card) => card.id)).toEqual(allCardIds);
    expect(searchCards(atlasContent.cards, "   ").map((card) => card.id)).toEqual(allCardIds);
  });

  it("surfaces the relevant seed card for a teaching-text query", () => {
    expect(searchCards(atlasContent.cards, "split").map((card) => card.id)).toContain("spacing.split-timing");
    expect(searchCards(atlasContent.cards, "toss").map((card) => card.id)).toContain("serve.toss-window");
    expect(searchCards(atlasContent.cards, "抛球").map((card) => card.id)).toContain("serve.toss-window");
    expect(searchCards(atlasContent.cards, "深中路").map((card) => card.id)).toContain("tactics.deep-middle");
    expect(searchCards(atlasContent.cards, "被挤到").map((card) => card.id)).toEqual(
      expect.arrayContaining(["spacing.split-timing", "spacing.contact-distance"])
    );
  });

  it("returns no cards for an unmatched query", () => {
    expect(searchCards(atlasContent.cards, "不存在的词")).toEqual([]);
  });

  it("returns each matching card only once when the query appears in multiple fields", () => {
    const ids = searchCards(atlasContent.cards, "split step").map((card) => card.id);

    expect(ids).toContain("spacing.split-timing");
    expect(new Set(ids).size).toBe(ids.length);
  });
});

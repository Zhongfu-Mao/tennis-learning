import { useState } from "react";
import { markCard, updateReviewResult, type UserState } from "../../app/state";
import type { AtlasContent } from "../../domain/atlas/content";
import { cardImagePath } from "../../domain/atlas/graph";
import type { KnowledgeCard } from "../../domain/atlas/schema";
import { getDueCards } from "../../domain/review/srs";

type ReviewViewProps = {
  content: AtlasContent;
  userState: UserState;
  onUserStateChange: (state: UserState) => void;
};

type ReviewScope = "all" | "equipment";

function isEquipmentCard(card: KnowledgeCard): boolean {
  return card.category.startsWith("equipment-");
}

export function ReviewView({ content, userState, onUserStateChange }: ReviewViewProps) {
  const [scope, setScope] = useState<ReviewScope>("all");
  const scopeCards = scope === "equipment" ? content.cards.filter(isEquipmentCard) : content.cards;
  const dueIds = getDueCards(
    scopeCards.map((card) => card.id),
    userState
  );
  const dueCards = scopeCards.filter((card) => dueIds.includes(card.id));
  const bookmarked = scopeCards.filter((card) => userState.cards[card.id]?.bookmarked);
  const confusing = scopeCards.filter((card) => userState.cards[card.id]?.confusing);
  const mastered = scopeCards.filter((card) => userState.cards[card.id]?.mastered);

  return (
    <section className="page-surface secondary-page review-view">
      <header className="secondary-header">
        <div>
          <p className="eyebrow">Review</p>
          <h1>Review Queue</h1>
          <p className="lede">Keep the atlas alive through a small daily queue and explicit learning states.</p>
        </div>
        <div className="route-meter" aria-label="Review queue summary">
          <span>Due now</span>
          <strong>{dueCards.length}</strong>
          <small>{scopeCards.length} total concepts</small>
        </div>
      </header>

      <div className="review-scope-switch" aria-label="Review scope">
        <button
          type="button"
          className={scope === "all" ? "active" : ""}
          aria-pressed={scope === "all"}
          onClick={() => setScope("all")}
        >
          全部 Atlas
        </button>
        <button
          type="button"
          className={scope === "equipment" ? "active" : ""}
          aria-pressed={scope === "equipment"}
          onClick={() => setScope("equipment")}
        >
          装备百科
        </button>
      </div>

      {scopeCards.length === 0 ? (
        <div className="atlas-empty-state secondary-empty-state">
          <strong>No reviewable cards yet</strong>
          <p>Add verified atlas cards in this scope before the review queue can schedule prompts.</p>
        </div>
      ) : dueCards.length > 0 ? (
        <div className="review-grid">
          {dueCards.map((card) => {
            const thumb = cardImagePath(content, card);
            return (
            <article className="review-card media-card" key={card.id} aria-label={`Review ${card.title}`}>
              <span
                className={thumb ? "media-thumb" : "media-thumb media-thumb-pending"}
                aria-hidden="true"
                style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
              />
              <div className="media-body">
              <div className="card-kicker">
                <span>Due now</span>
                <small>{card.progressionLens.targetLevel}</small>
              </div>
              <h2>{card.title}</h2>
              <p>{card.reviewPrompt}</p>
              <div className="button-row">
                <button
                  type="button"
                  className="action-secondary"
                  onClick={() => onUserStateChange(updateReviewResult(userState, card.id, false))}
                >
                  Forgot
                </button>
                <button
                  type="button"
                  className="action-primary"
                  onClick={() => onUserStateChange(updateReviewResult(userState, card.id, true))}
                >
                  Remembered
                </button>
              </div>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <div className="atlas-empty-state secondary-empty-state">
          <strong>Review caught up</strong>
          <p>No cards are due right now. Bookmarked and confusing states stay visible below.</p>
        </div>
      )}

      <section className="saved-states" aria-label="Saved states">
        <div>
          <p className="eyebrow">Saved states</p>
          <h2>Saved states</h2>
        </div>
        <div className="state-counts">
          <span>Bookmarked: {bookmarked.length}</span>
          <span>Confusing: {confusing.length}</span>
          <span>Mastered: {mastered.length}</span>
        </div>
        <div className="state-actions">
          {confusing.map((card) => (
            <button
              key={card.id}
              type="button"
              className="action-secondary"
              onClick={() => onUserStateChange(markCard(userState, card.id, "confusing", false))}
            >
              Clear confusing: {card.title}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

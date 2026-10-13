import type { UserState } from "../../app/state";
import type { AtlasContent } from "../../domain/atlas/content";
import { cardImagePath } from "../../domain/atlas/graph";
import { getPathCards } from "../../domain/path/recommendations";

type PathViewProps = {
  content: AtlasContent;
  userState: UserState;
};

function cardStateLabel(userState: UserState, cardId: string): string {
  const cardState = userState.cards[cardId];
  if (cardState?.confusing) return "Needs clarity";
  if (cardState?.bookmarked) return "Saved";
  if (cardState?.mastered) return "Mastered";
  if (cardState?.review) return "In review";
  return "Next";
}

export function PathView({ content, userState }: PathViewProps) {
  const cards = getPathCards(content, userState).slice(0, 6);
  const focus = userState.profile.focusPainPoints.slice(0, 4).join(" / ");

  return (
    <section className="page-surface secondary-page path-view">
      <header className="secondary-header">
        <div>
          <p className="eyebrow">
            {userState.profile.currentLevel} to {userState.profile.targetLevel}
          </p>
          <h1>My Path</h1>
          <p className="lede">
            Personal route recommendations from the atlas, tuned by target level, focus pain points, and card state.
          </p>
        </div>
        <div className="route-meter" aria-label="Personal route summary">
          <span>Current {userState.profile.currentLevel}</span>
          <strong>{userState.profile.targetLevel}</strong>
          <small>{focus}</small>
        </div>
      </header>

      {cards.length > 0 ? (
        <div className="path-grid">
          {cards.map((card, index) => {
            const thumb = cardImagePath(content, card);
            return (
              <article className="path-card media-card" key={card.id}>
                <span
                  className={thumb ? "media-thumb" : "media-thumb media-thumb-pending"}
                  aria-hidden="true"
                  style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                >
                  <span className="media-step">{index + 1}</span>
                </span>
                <div className="media-body">
                  <div className="card-kicker">
                    <span>Step {index + 1}</span>
                    <small>{cardStateLabel(userState, card.id)}</small>
                  </div>
                  <h2>{card.title}</h2>
                  <p>{card.progressionLens.whyItMatters}</p>
                  <dl className="mini-metrics">
                    <div>
                      <dt>Range</dt>
                      <dd>{card.progressionLens.targetLevel}</dd>
                    </div>
                    <div>
                      <dt>Cue</dt>
                      <dd>{card.progressionLens.onCourtCue}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="atlas-empty-state secondary-empty-state">
          <strong>No path recommendations yet</strong>
          <p>Add verified atlas cards before building a personal route.</p>
        </div>
      )}
    </section>
  );
}

import { logDrill, type UserState } from "../../app/state";
import type { AtlasContent } from "../../domain/atlas/content";
import { cardImagePath } from "../../domain/atlas/graph";
import type { KnowledgeCard } from "../../domain/atlas/schema";

type DrillViewProps = {
  content: AtlasContent;
  userState: UserState;
  onUserStateChange: (state: UserState) => void;
};

function logCount(userState: UserState, card: KnowledgeCard): number {
  return userState.drillLogs.filter((log) => log.cardId === card.id && log.drillId === card.practice.vrDrill.id).length;
}

function realCourtLogCount(userState: UserState, card: KnowledgeCard): number {
  const realCourtCheck = card.practice.realCourtCheck;
  if (!realCourtCheck) return 0;

  return userState.drillLogs.filter((log) => log.cardId === card.id && log.drillId === realCourtCheck.id).length;
}

export function DrillView({ content, userState, onUserStateChange }: DrillViewProps) {
  return (
    <section className="page-surface secondary-page drill-view">
      <header className="secondary-header">
        <div>
          <p className="eyebrow">VR First</p>
          <h1>VR Drill Library</h1>
          <p className="lede">Practice drills are generated from verified cards, with court checks kept ready for scarce court time.</p>
        </div>
        <div className="route-meter" aria-label="Drill log summary">
          <span>Logged</span>
          <strong>{userState.drillLogs.length}</strong>
          <small>latest local sessions</small>
        </div>
      </header>

      {content.cards.length > 0 ? (
        <div className="drill-grid">
          {content.cards.map((card) => {
            const count = logCount(userState, card);
            const realCourtCount = realCourtLogCount(userState, card);
            const thumb = cardImagePath(content, card);
            return (
              <article className="drill-card media-card" key={card.practice.vrDrill.id} aria-label={card.practice.vrDrill.title}>
                <span
                  className={thumb ? "media-thumb" : "media-thumb media-thumb-pending"}
                  aria-hidden="true"
                  style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                />
                <div className="media-body">
                <div className="card-kicker">
                  <span>{card.title}</span>
                  <small>{count} logged</small>
                </div>
                <h2>{card.practice.vrDrill.title}</h2>
                <p>{card.practice.vrDrill.instruction}</p>
                <dl className="mini-metrics">
                  <div>
                    <dt>Time</dt>
                    <dd>{card.practice.vrDrill.durationMinutes} minutes</dd>
                  </div>
                  <div>
                    <dt>Signal</dt>
                    <dd>{card.practice.vrDrill.successSignal}</dd>
                  </div>
                </dl>
                {card.practice.realCourtCheck && (
                  <p className="court-check">
                    Court check: {card.practice.realCourtCheck.title} · {card.practice.realCourtCheck.durationMinutes} minutes · {realCourtCount} saved
                  </p>
                )}
                <div className="button-row">
                  <button
                    type="button"
                    className="action-primary"
                    onClick={() => onUserStateChange(logDrill(userState, card.id, card.practice.vrDrill.id, "vr"))}
                  >
                    Log VR drill
                  </button>
                  {card.practice.realCourtCheck && (
                    <button
                      type="button"
                      className="action-secondary"
                      onClick={() =>
                        onUserStateChange(logDrill(userState, card.id, card.practice.realCourtCheck!.id, "real-court"))
                      }
                    >
                      Save court check
                    </button>
                  )}
                </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="atlas-empty-state secondary-empty-state">
          <strong>No VR drills yet</strong>
          <p>Add atlas cards with VR drills before logging practice.</p>
        </div>
      )}
    </section>
  );
}

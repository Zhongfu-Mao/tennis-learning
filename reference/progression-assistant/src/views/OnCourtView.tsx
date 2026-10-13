import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { TrainingIntent } from "../domain/types";

const timerOptions = [5, 10, 15];

type OnCourtViewProps = {
  activeIntent?: TrainingIntent;
  onGoCreateIntent: () => void;
  onComplete: (status: "done" | "partial" | "missed") => void;
};

export function OnCourtView({ activeIntent, onGoCreateIntent, onComplete }: OnCourtViewProps) {
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return undefined;
    let frame = 0;
    const tick = () => {
      setNow(Date.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [startedAt]);

  const totalMs = durationMinutes * 60 * 1000;
  const elapsedMs = startedAt === null ? 0 : Math.max(0, now - startedAt);
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const progress = startedAt === null ? 0 : Math.min(1, elapsedMs / totalMs);
  const timeLabel = useMemo(() => {
    const seconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }, [remainingMs]);

  if (!activeIntent) {
    return (
      <section className="on-court-page empty">
        <div className="on-court-inner">
          <p>On-Court Mode</p>
          <h1>先写一张上场卡</h1>
          <span>回到今天页，写下下一次只盯的一件事。</span>
          <button className="on-court-action" type="button" onClick={onGoCreateIntent}>回到今天</button>
        </div>
      </section>
    );
  }

  return (
    <section className="on-court-page">
      <div className="on-court-inner">
        <p>On-Court Mode</p>
        <h1>{activeIntent.cue}</h1>
        <span>{activeIntent.scenario}</span>
        <div className="on-court-timer" style={{ "--timer-progress": `${progress * 100}%` } as CSSProperties}>
          <strong>{timeLabel}</strong>
          <div className="on-court-timer-options">
            {timerOptions.map((minutes) => (
              <button
                className={durationMinutes === minutes ? "active" : ""}
                key={minutes}
                type="button"
                onClick={() => {
                  const started = Date.now();
                  setDurationMinutes(minutes);
                  setStartedAt(started);
                  setNow(started);
                }}
              >
                {minutes} 分钟
              </button>
            ))}
          </div>
        </div>
        <div className="on-court-completion">
          <button type="button" onClick={() => onComplete("done")}>做到了</button>
          <button type="button" onClick={() => onComplete("partial")}>部分做到</button>
          <button type="button" onClick={() => onComplete("missed")}>没做到</button>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { matchIssueLabel } from "../domain/insights";
import type { AppState, MatchJournal, TennisSession, TrainingIntent, VideoAttachment } from "../domain/types";
import { getVideoFile } from "../storage/videoStore";

type SessionDetailViewProps = {
  state: AppState;
  sessionId?: string;
  onBack: () => void;
  onDelete: (session: TennisSession) => void;
};

const completionLabels = {
  done: "做到",
  partial: "部分",
  missed: "没做到",
  pending: "待完成"
};

export function SessionDetailView({ state, sessionId, onBack, onDelete }: SessionDetailViewProps) {
  const session = state.sessions.find((item) => item.id === sessionId);

  if (!session) {
    return (
      <section className="page-grid">
        <section className="panel wide">
          <h1>没有找到这次复盘</h1>
          <button type="button" className="primary-action" onClick={onBack}>回到今天</button>
        </section>
      </section>
    );
  }

  const videos = state.videoAttachments.filter((video) => session.videoAttachmentIds?.includes(video.id));
  const journal = state.matchJournals.find((item) => item.id === session.matchJournalId || item.sessionId === session.id);
  const intent = state.intents.find((item) => item.id === session.intentId);

  return (
    <section className="page-grid session-detail-page">
      <header className="page-header compact session-detail-header">
        <div>
          <p>{new Date(session.date).toLocaleString("zh-CN")}</p>
          <h1>本次复盘详情</h1>
          <span>{session.sessionType} · {session.durationMinutes} 分钟 · {session.strokeFocus}</span>
        </div>
        <button className="danger-action" type="button" onClick={() => onDelete(session)}>删除本次复盘</button>
      </header>

      <section className="panel wide session-meta-grid">
        <Meta label="比赛压力" value={session.matchPressure} />
        <Meta label="身体状态" value={session.bodyStatus} />
        <Meta label="开始体力" value={`${session.energyBefore}/5`} />
        <Meta label="结束体力" value={`${session.energyAfter}/5`} />
      </section>

      <section className="panel wide">
        <div className="tag-row">
          {session.mainProblems.map((problem) => <span key={problem}>{problem}</span>)}
        </div>
        <p><strong>最好的一球：</strong>{session.bestMoment || "未记录"}</p>
        <p><strong>最糟的模式：</strong>{session.worstPattern || "未记录"}</p>
      </section>

      {intent && <IntentSnapshot intent={intent} session={session} />}
      {videos.length > 0 && (
        <section className="panel wide video-playback-panel">
          <h2>视频回放</h2>
          {videos.map((video) => <VideoPlayer attachment={video} key={video.id} />)}
        </section>
      )}
      {journal && <MatchJournalPanel journal={journal} />}
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <article className="completion-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function IntentSnapshot({ intent, session }: { intent: TrainingIntent; session: TennisSession }) {
  return (
    <section className="panel wide">
      <h2>当时的训练意图</h2>
      <p><strong>{intent.cue}</strong></p>
      <p>{intent.scenario}</p>
      <p className="recall-prompt">最终状态：{completionLabels[session.intentCompletion ?? intent.status]}</p>
    </section>
  );
}

function VideoPlayer({ attachment }: { attachment: VideoAttachment }) {
  const [url, setUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let alive = true;
    let objectUrl = "";
    getVideoFile(attachment.id).then((blob) => {
      if (!alive || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id]);

  function setRate(rate: number) {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }

  function stepFrame(direction: -1 | 1) {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = Math.max(0, video.currentTime + direction / 30);
  }

  return (
    <article className="video-player">
      <div>
        <strong>{attachment.name}</strong>
        <span>{attachment.note}</span>
      </div>
      {url ? <video data-testid={`session-video-${attachment.id}`} ref={videoRef} src={url} controls /> : <p>视频载入中...</p>}
      <div className="inline-actions">
        <button type="button" onClick={() => setRate(0.25)}>0.25x</button>
        <button type="button" onClick={() => setRate(0.5)}>0.5x</button>
        <button type="button" onClick={() => setRate(1)}>1x</button>
        <button type="button" onClick={() => stepFrame(-1)}>上一帧</button>
        <button type="button" onClick={() => stepFrame(1)}>下一帧</button>
      </div>
    </article>
  );
}

function MatchJournalPanel({ journal }: { journal: MatchJournal }) {
  return (
    <section className="panel wide">
      <h2>比赛日记</h2>
      <p><strong>比分：</strong>{journal.score || "未记录"}</p>
      <p><strong>双误：</strong>{journal.doubleFaults} 个</p>
      <p><strong>一发率估计：</strong>{journal.firstServeEstimate}%</p>
      <div className="tag-row">
        {journal.keyPointIssues.map((issue) => <span key={issue}>{matchIssueLabel(issue)}</span>)}
      </div>
    </section>
  );
}

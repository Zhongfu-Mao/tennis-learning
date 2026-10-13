import { useState } from "react";
import { CardDiagram } from "../components/CardDiagram";
import { techniqueCards } from "../domain/cards";
import {
  buildWeeklyPlan,
  getProgressionRoadmap,
  matchPlaybook,
  strengthBlocks
} from "../domain/roadmap";
import {
  fatigueRules,
  footworkDrills,
  progressionBlocks,
  strengthPhases
} from "../domain/mastery";
import { getUserProgress } from "../domain/progress";
import { getRecommendations } from "../domain/recommendations";
import { getBodyTrend, getMatchJournalSummary } from "../domain/insights";
import type { AppState, MainProblem } from "../domain/types";

export function ProgressView({
  state,
  onUpdate,
  onOpenSession
}: {
  state: AppState;
  onUpdate: (state: AppState) => void;
  onOpenSession?: (sessionId: string) => void;
}) {
  const [section, setSection] = useState<"roadmap" | "spacing" | "mindset" | "strength" | "weekly">("roadmap");
  const progress = getUserProgress(state);
  const bodyTrend = getBodyTrend(state);
  const matchSummary = getMatchJournalSummary(state);

  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>Progress</p>
        <h1>进度</h1>
        <span>把路线、周复盘、空间、心态和力量收在一个进度区里，按需要下钻。</span>
      </header>
      <div className="metric-strip">
        <div><strong>{progress.stageProgress}%</strong><span>阶段验收</span></div>
        <div><strong>{progress.intentCompletion}%</strong><span>意图完成率</span></div>
        <div><strong>{progress.bodyLoad}</strong><span>身体负荷</span></div>
      </div>
      <section className="roadmap-grid">
        <article className="panel">
          <h2>近 30 天身体趋势</h2>
          {bodyTrend.items.length ? (
            <div className="tag-row">
              {bodyTrend.items.map((item) => (
                <span key={item.status}>{item.label} x {item.count}</span>
              ))}
            </div>
          ) : (
            <p>最近没有标记疼痛或疲劳。继续用复盘记录身体状态，就能看到负荷变化。</p>
          )}
          <p className="recall-prompt">总标记：{bodyTrend.totalFlagged} 次</p>
        </article>
        <article className="panel">
          <h2>比赛日记摘要</h2>
          {matchSummary.matchCount ? (
            <>
              <p><strong>{matchSummary.matchCount}</strong> 场已记录；平均双误 {matchSummary.averageDoubleFaults} 个；一发率估计 {matchSummary.averageFirstServeEstimate}%</p>
              <p className="recall-prompt">高频关键分模式：{matchSummary.topIssue?.label ?? "暂未标记"}</p>
            </>
          ) : (
            <p>还没有比赛日记。比赛复盘里记录比分、双误和关键分模式后，这里会显示稳定性趋势。</p>
          )}
        </article>
      </section>
      <div className="segmented">
        <button className={section === "roadmap" ? "active" : ""} onClick={() => setSection("roadmap")}>路线</button>
        <button className={section === "weekly" ? "active" : ""} onClick={() => setSection("weekly")}>周复盘</button>
        <button className={section === "spacing" ? "active" : ""} onClick={() => setSection("spacing")}>空间步伐</button>
        <button className={section === "mindset" ? "active" : ""} onClick={() => setSection("mindset")}>比赛心态</button>
        <button className={section === "strength" ? "active" : ""} onClick={() => setSection("strength")}>力量</button>
      </div>
      {section === "roadmap" && <RoadmapView state={state} onUpdate={onUpdate} />}
      {section === "weekly" && <WeeklyReview state={state} onOpenSession={onOpenSession} />}
      {section === "spacing" && <SpacingView />}
      {section === "mindset" && <MindsetView />}
      {section === "strength" && <StrengthView state={state} />}
    </section>
  );
}

function RoadmapView({ state, onUpdate }: { state: AppState; onUpdate: (state: AppState) => void }) {
  const stages = getProgressionRoadmap();
  const completed = new Set(state.programProgress.completedAcceptanceTests);

  function toggleAcceptance(weekRange: string) {
    const nextCompleted = completed.has(weekRange)
      ? state.programProgress.completedAcceptanceTests.filter((item) => item !== weekRange)
      : [...state.programProgress.completedAcceptanceTests, weekRange];
    onUpdate({
      ...state,
      programProgress: {
        ...state.programProgress,
        completedAcceptanceTests: nextCompleted
      }
    });
  }

  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>V2 Progression Route</p>
        <h1>2.7 到 4.0 进阶路线</h1>
        <span>先稳定，再深度和开局，最后进入主动性和比赛管理。</span>
      </header>
      <section className="panel wide">
        <h2>12 周进阶周期</h2>
        <p>每个阶段都包含周块和验收测试，勾选通过后 Dashboard 的阶段进度才会上升。</p>
      </section>
      <section className="timeline">
        {stages.map((stage) => (
          <article className="panel stage-panel" key={stage.id}>
            <span className="card-kicker">{stage.levelBand}</span>
            <h2>{stage.title}</h2>
            <ul>{stage.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
            <p><strong>周重点：</strong>{stage.weeklyFocus}</p>
            <div className="tag-row">{stage.categories.map((category) => <span key={category}>{categoryLabel(category)}</span>)}</div>
            <div className="program-grid">
              {stage.blocks.map((block) => (
                <article className="program-card" key={block.weekRange}>
                  <span className="card-kicker">{block.weekRange}</span>
                  <h3>{block.title}</h3>
                  <p><strong>网球：</strong>{block.tennisFocus}</p>
                  <p><strong>力量：</strong>{block.strengthFocus}</p>
                  <p className="recall-prompt">{block.acceptanceTest}</p>
                  <label className="acceptance-check">
                    <input
                      type="checkbox"
                      checked={completed.has(block.weekRange)}
                      onChange={() => toggleAcceptance(block.weekRange)}
                    />
                    本周验收通过
                  </label>
                </article>
              ))}
            </div>
            <div className="stage-assessment">
              <h3>阶段验收</h3>
              <p><strong>测试：</strong>{stage.assessment.test}</p>
              <p><strong>通过标准：</strong>{stage.assessment.passStandard}</p>
              <p className="warning-note">{stage.assessment.commonFailure}</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function SpacingView() {
  const spacingCards = techniqueCards.filter((card) => card.category === "spacing_footwork");
  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>V3 Spacing Lab</p>
        <h1>空间感和步伐专项</h1>
        <span>把“被挤到”拆成启动时机、击球距离、最后调整步和回位路线。</span>
      </header>
      <section className="card-grid library-grid">
        {spacingCards.map((card) => (
          <article className="tech-card detail-card" key={card.id}>
            <CardDiagram type={card.diagram} />
            <div><span className="card-kicker">{card.id}</span><h3>{card.title}</h3><p>{card.principle}</p><p><strong>下次练：</strong>{card.drill}</p></div>
          </article>
        ))}
      </section>
      <section className="panel wide">
        <h2>空间感判断顺序</h2>
        <div className="workflow-row"><span>对手触球 split</span><span>判断深浅和方向</span><span>最后两步小调整</span><span>击球前停稳</span></div>
      </section>
      <section className="panel wide">
        <h2>步伐动作库</h2>
        <div className="atlas-grid">
          {footworkDrills.map((drill) => (
            <article className="atlas-card" key={drill.id}>
              <span className="card-kicker">{drill.id} / {problemLabel(drill.problem)}</span>
              <h3>{drill.name}</h3>
              <p><strong>模式：</strong>{drill.pattern}</p>
              <p><strong>Cue：</strong>{drill.cue}</p>
              <p><strong>剂量：</strong>{drill.dosage}</p>
              <p className="recall-prompt">{drill.successSignal}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function MindsetView() {
  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>V3 Match Mindset</p>
        <h1>比赛心态工具箱</h1>
        <span>机会球、双误和关键分都用固定流程处理，比赛中少重建动作。</span>
      </header>
      <section className="roadmap-grid">
        {(["赛前", "赛中", "赛后"] as const).map((phase) => (
          <article className="panel" key={phase}>
            <span className="card-kicker">{phase}</span>
            <h2>{phase}流程</h2>
            <ol>{matchPlaybook.phases[phase].map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        ))}
      </section>
      <section className="panel wide">
        <h2>赛中重置和比分触发</h2>
        <div className="atlas-grid">
          {matchPlaybook.resetProtocols.map((protocol) => (
            <article className="atlas-card" key={protocol.trigger}>
              <span className="card-kicker">{protocol.trigger}</span>
              <h3>{protocol.title}</h3>
              <ol>{protocol.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            </article>
          ))}
        </div>
        <div className="atlas-grid">
          {matchPlaybook.scoreTriggers.map((trigger) => (
            <article className="atlas-card" key={trigger.trigger}>
              <span className="card-kicker">{trigger.trigger}</span>
              <h3>{trigger.riskRule}</h3>
              <p><strong>身体 cue：</strong>{trigger.bodyCue}</p>
              <p><strong>目标：</strong>{trigger.target}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function StrengthView({ state }: { state: AppState }) {
  const plan = buildWeeklyPlan(state.profile, state.sessions, state.programProgress.startDate);
  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>V4 Periodized Plan</p>
        <h1>力量训练整合</h1>
        <span>把力量训练接回网球表现：移动刹车、旋转发力、肩胛稳定和核心抗旋。</span>
      </header>
      <section className="panel wide">
        <h2>本周周期计划</h2>
        <p><strong>阶段：</strong>{plan.phase}（{plan.phaseWeeks}）</p>
        <p><strong>主线：</strong>{plan.focus}</p>
        <p><strong>负荷：</strong>{plan.load}</p>
        <div className="week-grid">{plan.days.map((day) => <article className={`week-day ${day.kind}`} key={day.day}><span>{day.day}</span><h3>{day.title}</h3><p>{day.detail}</p></article>)}</div>
      </section>
      <section className="roadmap-grid">
        {strengthBlocks.map((block) => (
          <article className="panel strength-block" key={block.id}>
            <span className="card-kicker">{block.id}</span>
            <h2>{block.title}</h2>
            <p>{block.tennisLink}</p>
            <div className="tag-row">{block.movements.map((movement) => <span key={movement}>{movement}</span>)}</div>
            <p className="warning-note">{block.caution}</p>
          </article>
        ))}
      </section>
      <section className="panel wide">
        <h2>12 周力量周期</h2>
        <div className="program-grid">{strengthPhases.map((phase) => <article className="program-card" key={phase.phase}><span className="card-kicker">{phase.weeks}</span><h3>{phase.phase}</h3><p><strong>目标：</strong>{phase.goal}</p><p><strong>动作：</strong>{phase.exercises.join(" / ")}</p><p className="recall-prompt">{phase.tennisTransfer}</p></article>)}</div>
      </section>
      <section className="panel wide">
        <h2>疲劳和疼痛调档规则</h2>
        <div className="atlas-grid">{fatigueRules.map((rule) => <article className="atlas-card" key={rule.bodyStatus}><span className="card-kicker">{rule.bodyStatus}</span><h3>{rule.adjustment}</h3><p><strong>保留：</strong>{rule.keep}</p><p><strong>避免：</strong>{rule.avoid}</p></article>)}</div>
      </section>
    </section>
  );
}

function WeeklyReview({ state, onOpenSession }: { state: AppState; onOpenSession?: (sessionId: string) => void }) {
  const recommendation = getRecommendations(state.sessions);
  const recent = state.sessions.slice(0, 7);
  return (
    <section className="page-grid">
      <header className="page-header compact"><p>Weekly Review</p><h1>周复盘</h1><span>看趋势，不把每次失误都当成新问题。</span></header>
      <section className="panel wide"><h2>本周主线</h2><p>{recommendation.nextIntent}</p></section>
      <section className="panel"><h2>重复问题</h2>{recommendation.repeatedProblems.length ? <ul className="session-list">{recommendation.repeatedProblems.map((problem) => <li key={problem}>{problemLabel(problem)}</li>)}</ul> : <p>还没有 7 天内重复 3 次的问题。继续记录，趋势会自己浮出来。</p>}</section>
      <section className="panel"><h2>最近记录</h2><ul className="session-list">{recent.map((session) => <li key={session.id}>{onOpenSession ? <button type="button" className="session-list-button" onClick={() => onOpenSession(session.id)}><strong>{new Date(session.date).toLocaleDateString("zh-CN")}</strong><span>{session.mainProblems.map(problemLabel).join(" / ") || "未标记问题"}</span></button> : <><strong>{new Date(session.date).toLocaleDateString("zh-CN")}</strong><span>{session.mainProblems.map(problemLabel).join(" / ") || "未标记问题"}</span></>}</li>)}</ul></section>
    </section>
  );
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    all: "全部",
    knowledge_breadth: "基础认知",
    progression_route: "进阶路线",
    technique_principles: "技术原理",
    spacing_footwork: "空间步伐",
    match_mindset: "比赛心态",
    strength_integration: "力量整合"
  };
  return labels[category] ?? category;
}

function problemLabel(problem: MainProblem) {
  const labels: Record<MainProblem, string> = {
    late_contact: "击球点晚",
    too_close: "被挤到",
    overhit: "机会球打飞",
    net_error: "下网多",
    long_error: "出界多",
    footwork_late: "脚步启动晚",
    serve_inconsistent: "发球不稳定",
    opportunity_error: "机会球处理差"
  };
  return labels[problem] ?? problem;
}

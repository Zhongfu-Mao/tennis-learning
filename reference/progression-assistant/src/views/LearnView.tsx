import { useState } from "react";
import { CardDiagram } from "../components/CardDiagram";
import { techniqueCards } from "../domain/cards";
import { knowledgeChapters, knowledgeMap } from "../domain/roadmap";
import { getDueKnowledgeCards, reviewKnowledgeCard } from "../domain/progress";
import type { AppState } from "../domain/types";
import type { KnowledgeNode } from "../domain/knowledge";

type LearnViewProps = {
  state: AppState;
  onUpdate: (state: AppState) => void;
};

export function LearnView({ state, onUpdate }: LearnViewProps) {
  const [mode, setMode] = useState<"srs" | "knowledge" | "technique">("srs");

  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>Learning Queue</p>
        <h1>学习</h1>
        <span>闲时不再翻目录，先处理今天到期的卡，再进入知识地图或技术库。</span>
      </header>
      <div className="segmented">
        <button className={mode === "srs" ? "active" : ""} onClick={() => setMode("srs")}>今日复习</button>
        <button className={mode === "knowledge" ? "active" : ""} onClick={() => setMode("knowledge")}>知识地图</button>
        <button className={mode === "technique" ? "active" : ""} onClick={() => setMode("technique")}>技术库</button>
      </div>
      {mode === "srs" && <SrsReviewView state={state} onUpdate={onUpdate} />}
      {mode === "knowledge" && <KnowledgeMapView />}
      {mode === "technique" && <TechniqueLibrary />}
    </section>
  );
}

function SrsReviewView({ state, onUpdate }: LearnViewProps) {
  const due = getDueKnowledgeCards(state, 5);

  return (
    <section className="panel wide mastery-panel">
      <h2>今日 SRS 复习</h2>
      {due.length === 0 ? (
        <p>今天没有到期知识卡。可以去知识地图自由浏览，但不需要硬刷。</p>
      ) : (
        <div className="knowledge-grid">
          {due.map(({ card }) => (
            <article className="panel knowledge-node srs-card" key={card.id}>
              <KnowledgeVisual visual={card.visual} chapter={card.chapter} />
              <span className="card-kicker">{card.id} / 先回忆，后翻答案</span>
              <h2>{card.title}</h2>
              <KnowledgeCardBody node={card} />
              <div className="inline-actions">
                <button onClick={() => onUpdate(reviewKnowledgeCard(state, card.id, false))}>没想起来</button>
                <button onClick={() => onUpdate(reviewKnowledgeCard(state, card.id, true))}>想起来了</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function TechniqueLibrary() {
  const [category, setCategory] = useState<string>("all");
  const filtered = category === "all" ? techniqueCards : techniqueCards.filter((card) => card.category === category);

  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>Technique Cards</p>
        <h1>技术原理库</h1>
        <span>每张卡只解释一个原则，用图解强化记忆。</span>
      </header>
      <div className="segmented">
        {["all", "technique_principles", "spacing_footwork", "match_mindset", "progression_route", "strength_integration"].map((item) => (
          <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>
            {categoryLabel(item)}
          </button>
        ))}
      </div>
      <section className="card-grid library-grid">
        {filtered.map((card) => (
          <article className="tech-card detail-card" key={card.id}>
            <CardDiagram type={card.diagram} />
            <div>
              <span className="card-kicker">{card.id} / {categoryLabel(card.category)}</span>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
              <p><strong>原理：</strong>{card.principle}</p>
              <p><strong>练习：</strong>{card.drill}</p>
              <p><strong>常见误区：</strong>{card.commonMistake}</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function KnowledgeMapView() {
  const [chapter, setChapter] = useState<string>("all");
  const filtered = chapter === "all" ? knowledgeMap : knowledgeMap.filter((node) => node.chapter === chapter);

  return (
    <section className="page-grid">
      <header className="page-header compact">
        <p>V2 Knowledge Map</p>
        <h1>知识地图</h1>
        <span>48 张基础知识卡，用视觉记忆、关键对比和场上应用补齐网球底层认知。</span>
      </header>
      <div className="segmented knowledge-tabs">
        {knowledgeChapters.map((item) => (
          <button className={chapter === item.id ? "active" : ""} onClick={() => setChapter(item.id)} key={item.id}>
            {item.label}
          </button>
        ))}
      </div>
      <section className="knowledge-grid">
        {filtered.map((node) => (
          <article className="panel knowledge-node" key={node.id}>
            <KnowledgeVisual visual={node.visual} chapter={node.chapter} />
            <span className="card-kicker">{node.id} / {knowledgeChapterLabel(node.chapter)}</span>
            <h2>{node.title}</h2>
            <KnowledgeCardBody node={node} />
          </article>
        ))}
      </section>
    </section>
  );
}

function KnowledgeCardBody({ node }: { node: KnowledgeNode }) {
  return (
    <>
      <p className="recall-prompt">{node.recallPrompt}</p>
      <details>
        <summary>翻答案</summary>
        <p className="memory-image"><strong>视觉记忆：</strong>{node.memoryImage}</p>
        <div className="knowledge-facts">
          <p><strong>关键对比：</strong>{node.comparison}</p>
          <p><strong>场上应用：</strong>{node.fieldApplication}</p>
          <p><strong>记住它：</strong>{node.takeaway}</p>
          <p><strong>为什么重要：</strong>{node.whyItMatters}</p>
        </div>
      </details>
    </>
  );
}

function KnowledgeVisual({ visual, chapter }: { visual: string; chapter: string }) {
  return (
    <div className={`knowledge-visual visual-${visual}`} aria-hidden="true">
      <div className="visual-court-line" />
      <div className="visual-orbit" />
      <div className="visual-object" />
      <span>{knowledgeChapterLabel(chapter)}</span>
    </div>
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

function knowledgeChapterLabel(chapter: string) {
  return knowledgeChapters.find((item) => item.id === chapter)?.label ?? chapter;
}

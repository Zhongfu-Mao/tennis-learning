import type { AtlasTopic } from "../../domain/atlas/schema";

type TopicRailProps = {
  topics: AtlasTopic[];
  activeTopicId: string | null;
  onSelect: (topicId: string | null) => void;
};

export function TopicRail({ topics, activeTopicId, onSelect }: TopicRailProps) {
  return (
    <nav className="topic-rail" aria-label="Atlas topics">
      <button
        type="button"
        className={activeTopicId === null ? "topic-pill active" : "topic-pill"}
        aria-pressed={activeTopicId === null}
        onClick={() => onSelect(null)}
      >
        <span>All</span>
        <small>{topics.length} topics</small>
      </button>
      {topics.map((topic) => (
        <button
          key={topic.id}
          type="button"
          className={activeTopicId === topic.id ? "topic-pill active" : "topic-pill"}
          aria-pressed={activeTopicId === topic.id}
          onClick={() => onSelect(topic.id)}
        >
          <span>{topic.label}</span>
          <small>{topic.description}</small>
        </button>
      ))}
    </nav>
  );
}

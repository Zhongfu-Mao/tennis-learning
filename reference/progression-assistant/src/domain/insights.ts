import type { AppState, BodyStatus, MatchKeyPointIssue } from "./types";

const bodyLabels: Record<BodyStatus, string> = {
  normal: "正常",
  sore: "疲劳",
  shoulder: "肩",
  knee: "膝",
  ankle: "踝",
  back: "背"
};

const issueLabels: Record<MatchKeyPointIssue, string> = {
  double_fault: "关键分双误",
  overhit: "机会球打飞",
  net_error: "保守球下网",
  passive_short: "被动球回浅",
  rush: "着急出手"
};

export function getBodyTrend(state: AppState, days = 30, now = new Date()) {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  const counts = new Map<BodyStatus, number>();

  state.sessions.forEach((session) => {
    if (new Date(session.date).getTime() < cutoff || session.bodyStatus === "normal") return;
    counts.set(session.bodyStatus, (counts.get(session.bodyStatus) ?? 0) + 1);
  });

  const items = [...counts.entries()]
    .map(([status, count]) => ({ status, label: bodyLabels[status], count }))
    .sort((a, b) => b.count - a.count);

  return {
    days,
    totalFlagged: items.reduce((total, item) => total + item.count, 0),
    topStatus: items[0],
    items
  };
}

export function getMatchJournalSummary(state: AppState) {
  const journals = state.matchJournals;
  const issueCounts = new Map<MatchKeyPointIssue, number>();

  journals.forEach((journal) => {
    journal.keyPointIssues.forEach((issue) => {
      issueCounts.set(issue, (issueCounts.get(issue) ?? 0) + 1);
    });
  });

  const topIssue = [...issueCounts.entries()]
    .map(([issue, count]) => ({ issue, label: issueLabels[issue], count }))
    .sort((a, b) => b.count - a.count)[0];

  const averageDoubleFaults = journals.length
    ? Math.round(journals.reduce((total, journal) => total + journal.doubleFaults, 0) / journals.length)
    : 0;
  const averageFirstServeEstimate = journals.length
    ? Math.round(journals.reduce((total, journal) => total + journal.firstServeEstimate, 0) / journals.length)
    : 0;

  return {
    matchCount: journals.length,
    averageDoubleFaults,
    averageFirstServeEstimate,
    topIssue
  };
}

export function matchIssueLabel(issue: MatchKeyPointIssue) {
  return issueLabels[issue];
}

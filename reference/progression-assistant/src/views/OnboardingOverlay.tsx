import { useMemo, useState } from "react";
import { createTrainingIntent } from "../domain/progress";
import type { AppState, MainProblem, TennisProfile, TrainingIntent } from "../domain/types";

const levels: TennisProfile["currentLevel"][] = ["2.7", "3.0", "3.5", "4.0"];

const problems: Array<{ value: MainProblem; label: string; suggestion: string }> = [
  { value: "late_contact", label: "击球点晚", suggestion: "下一次只盯击球点保持在身体前方。" },
  { value: "too_close", label: "被挤到", suggestion: "下一次只盯来球后退半步，给挥拍留空间。" },
  { value: "overhit", label: "机会球打飞", suggestion: "下一次只盯机会球先打七成力量。" },
  { value: "net_error", label: "下网多", suggestion: "下一次只盯过网高度，不急着压线。" },
  { value: "long_error", label: "出界多", suggestion: "下一次只盯收拍完整，让球转起来。" },
  { value: "footwork_late", label: "脚步启动晚", suggestion: "下一次只盯对手触球瞬间 split step。" },
  { value: "serve_inconsistent", label: "发球不稳定", suggestion: "下一次只盯抛球高度和落点稳定。" },
  { value: "opportunity_error", label: "机会球处理差", suggestion: "下一次只盯机会球先选大目标。" }
];

type OnboardingOverlayProps = {
  state: AppState;
  onComplete: (state: AppState) => void;
};

export function shouldShowOnboarding(state: AppState): boolean {
  return (
    !state.onboardingCompletedAt &&
    state.sessions.length === 0 &&
    state.intents.length === 0 &&
    Object.keys(state.knowledgeProgress).length === 0
  );
}

export function OnboardingOverlay({ state, onComplete }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<TennisProfile["currentLevel"]>(state.profile.currentLevel);
  const [selectedProblems, setSelectedProblems] = useState<MainProblem[]>(state.profile.commonProblems.slice(0, 2));
  const suggestion = useMemo(() => {
    const first = problems.find((problem) => problem.value === selectedProblems[0]);
    return first?.suggestion ?? "下一次只盯一件事：稳定过网并落到深区。";
  }, [selectedProblems]);
  const [intentCue, setIntentCue] = useState(suggestion);

  function toggleProblem(problem: MainProblem) {
    setSelectedProblems((current) => {
      if (current.includes(problem)) return current.filter((item) => item !== problem);
      return [...current, problem].slice(-2);
    });
  }

  function complete() {
    const intent: TrainingIntent = createTrainingIntent(
      intentCue.trim() || suggestion,
      "下一次上场前打开“上场”模式，只看这一条。"
    );
    onComplete({
      ...state,
      profile: {
        ...state.profile,
        currentLevel: level,
        commonProblems: selectedProblems.length ? selectedProblems : state.profile.commonProblems
      },
      intents: [intent, ...state.intents],
      onboardingCompletedAt: new Date().toISOString()
    });
  }

  function nextStep() {
    if (step === 1) setIntentCue(suggestion);
    setStep((current) => Math.min(current + 1, 2));
  }

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section className="onboarding-panel">
        <p className="card-kicker">Start</p>
        {step === 0 && (
          <>
            <h1 id="onboarding-title">你现在在哪一档</h1>
            <div className="onboarding-options">
              {levels.map((item) => (
                <label className="chip" key={item}>
                  <input
                    type="radio"
                    name="level"
                    checked={level === item}
                    onChange={() => setLevel(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
            <button className="primary-action" type="button" onClick={nextStep}>下一步</button>
          </>
        )}
        {step === 1 && (
          <>
            <h1 id="onboarding-title">最近最常出现的两个问题</h1>
            <div className="chip-grid onboarding-problems">
              {problems.map((problem) => (
                <label className="chip" key={problem.value}>
                  <input
                    type="checkbox"
                    checked={selectedProblems.includes(problem.value)}
                    onChange={() => toggleProblem(problem.value)}
                  />
                  {problem.label}
                </label>
              ))}
            </div>
            <button className="primary-action" type="button" onClick={nextStep}>下一步</button>
          </>
        )}
        {step === 2 && (
          <>
            <h1 id="onboarding-title">下一次想盯的一件事</h1>
            <label className="onboarding-textarea">
              <span>训练前意图</span>
              <textarea value={intentCue} onChange={(event) => setIntentCue(event.target.value)} />
            </label>
            <button className="primary-action" type="button" onClick={complete}>完成并生成意图</button>
          </>
        )}
      </section>
    </div>
  );
}

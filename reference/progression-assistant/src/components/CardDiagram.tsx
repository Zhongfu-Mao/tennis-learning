import type React from "react";
import type { TechniqueCard } from "../domain/types";

type Props = {
  type: TechniqueCard["diagram"];
};

export function CardDiagram({ type }: Props) {
  return (
    <div className={`diagram diagram-${type}`} aria-hidden="true">
      <svg viewBox="0 0 180 110" role="img">
        {diagramSvg[type]}
      </svg>
      <span>{diagramLabel[type]}</span>
    </div>
  );
}

const diagramLabel: Record<TechniqueCard["diagram"], string> = {
  priority: "高度 > 深度 > 方向 > 速度",
  contact: "近 / 正好 / 远",
  split: "split -> 判断 -> 调整步",
  chain: "脚 -> 髋 -> 核心 -> 拍头",
  serve: "稳定抛球窗口",
  target: "大目标优先"
};

const diagramSvg: Record<TechniqueCard["diagram"], React.ReactNode> = {
  priority: (
    <>
      <polygon points="90,14 122,42 58,42" />
      <polygon points="58,46 122,46 144,68 36,68" />
      <polygon points="36,72 144,72 166,96 14,96" />
      <text x="90" y="36">高</text>
      <text x="90" y="62">深</text>
      <text x="90" y="89">稳</text>
    </>
  ),
  contact: (
    <>
      <circle cx="70" cy="58" r="12" />
      <line x1="82" y1="58" x2="136" y2="34" />
      <circle cx="132" cy="36" r="6" />
      <path d="M42 84 C78 72 94 46 138 24" />
      <text x="118" y="62">前方</text>
    </>
  ),
  split: (
    <>
      <line x1="90" y1="24" x2="90" y2="58" />
      <line x1="90" y1="58" x2="58" y2="88" />
      <line x1="90" y1="58" x2="122" y2="88" />
      <path d="M42 88 H138" />
      <path d="M54 72 L28 54" />
      <path d="M126 72 L152 54" />
      <text x="90" y="20">落地</text>
    </>
  ),
  chain: (
    <>
      <circle cx="34" cy="74" r="10" />
      <circle cx="70" cy="62" r="10" />
      <circle cx="106" cy="48" r="10" />
      <circle cx="144" cy="30" r="10" />
      <path d="M44 70 C58 66 58 66 60 64" />
      <path d="M80 58 C94 54 94 54 96 50" />
      <path d="M116 44 C130 38 130 38 134 34" />
      <text x="90" y="96">脚 髋 核心 拍</text>
    </>
  ),
  serve: (
    <>
      <rect x="34" y="28" width="42" height="58" rx="4" />
      <rect x="104" y="18" width="34" height="68" rx="17" />
      <circle cx="121" cy="32" r="6" />
      <path d="M56 80 C80 44 96 30 121 32" />
      <text x="112" y="104">窗口</text>
    </>
  ),
  target: (
    <>
      <rect x="28" y="22" width="124" height="68" rx="4" />
      <line x1="90" y1="22" x2="90" y2="90" />
      <rect x="44" y="42" width="40" height="28" rx="4" />
      <rect x="116" y="28" width="18" height="18" rx="2" />
      <path d="M20 92 C58 46 74 44 64 56" />
      <text x="42" y="102">大目标</text>
    </>
  )
};

/* =========================================================
   ステータス定義 / 総合所見の観点（data.jsx から移植）
   ========================================================= */
import type { Assessment, CandidateStatus } from "./types";

export type Tone = "neutral" | "info" | "cyan" | "good" | "warn" | "muted";

export interface StatusDef {
  key: CandidateStatus;
  tone: Tone;
  desc: string;
}

export const STATUSES: StatusDef[] = [
  { key: "面談済", tone: "neutral", desc: "第一面談完了、まだ動いていない" },
  { key: "紹介中", tone: "info", desc: "提携先企業に紹介済み" },
  { key: "内定", tone: "cyan", desc: "内定が出た" },
  { key: "決定", tone: "good", desc: "入社決定（成果報酬対象）" },
  { key: "保留", tone: "warn", desc: "判断待ち・連絡待ち" },
  { key: "見送り", tone: "muted", desc: "今回は送客しない" },
];

export const STATUS_TONE: Record<string, Tone> = Object.fromEntries(
  STATUSES.map((s) => [s.key, s.tone])
) as Record<string, Tone>;

export interface AsmtItemDef {
  key: keyof Omit<Assessment, "notes">;
  label: string;
  desc: string;
}

export const ASMT_ITEMS: AsmtItemDef[] = [
  { key: "marketValue", label: "経験・スキルの市場価値", desc: "現職・前職の経験が転職市場でどう評価されるか" },
  { key: "selfAwareness", label: "自己理解の深さ", desc: "長所短所・転職理由の解像度" },
  { key: "stressRes", label: "ストレス耐性・メンタル安定性", desc: "面談での発言・エピソードから判断" },
  { key: "growthDrive", label: "成長意欲・行動力", desc: "学ぶ姿勢、挑戦意欲" },
  { key: "communication", label: "対人・コミュニケーション", desc: "面談中の印象、表現力" },
  { key: "motivation", label: "転職の本気度・緊急度", desc: "いつまでに転職したいか、動機の強さ" },
];

export function asmtTotal(asmt: Partial<Assessment> | null | undefined): number {
  return ASMT_ITEMS.reduce((n, it) => n + (Number(asmt?.[it.key]) || 0), 0);
}

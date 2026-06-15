/* =========================================================
   キャリアコーチング（有料）— プラン定義・セッション雛形
   正本: 可能性LABO コーチ向け業務マニュアル v1.0
   ========================================================= */
import type { Coaching, CoachingPlan, CoachingSession } from "./types";

export interface PlanInfo {
  label: string;
  price: number;
  duration: string;
  sessions: number;
  deliverables: string[];
}

export const PLAN_INFO: Record<CoachingPlan, PlanInfo> = {
  standard: {
    label: "スタンダード",
    price: 80000,
    duration: "1ヶ月 / 全4回",
    sessions: 4,
    deliverables: ["キャリアプランシート"],
  },
  full: {
    label: "フル",
    price: 150000,
    duration: "2ヶ月 / 全8回",
    sessions: 8,
    deliverables: ["キャリアプランシート", "職務経歴書添削", "面接フィードバックシート"],
  },
};

interface SessionTemplate {
  theme: string;
  goal: string;
}

const STANDARD_SESSIONS: SessionTemplate[] = [
  { theme: "自己分析", goal: "価値観・強みを言語化する" },
  { theme: "市場価値診断", goal: "市場における自分の立ち位置を把握する" },
  { theme: "方向性決定", goal: "キャリアの方向性を1本に絞る" },
  { theme: "行動計画", goal: "来月から動けるアクションプランを作る" },
];

const FULL_SESSIONS: SessionTemplate[] = [
  { theme: "自己分析", goal: "価値観・強みを言語化する" },
  { theme: "市場価値診断", goal: "市場における自分の立ち位置を把握する" },
  { theme: "方向性決定", goal: "キャリア方向性を1本に絞る" },
  { theme: "職務経歴書作成", goal: "職務経歴書の構成を固める" },
  { theme: "書類添削・応募開始", goal: "応募できる状態の書類を完成させる" },
  { theme: "面接対策", goal: "頻出質問への回答を準備する" },
  { theme: "模擬面接", goal: "本番想定の面接練習を行う" },
  { theme: "振り返り・内定後フォロー", goal: "内定後の意思決定をサポートする" },
];

export const SESSION_TEMPLATES: Record<CoachingPlan, SessionTemplate[]> = {
  standard: STANDARD_SESSIONS,
  full: FULL_SESSIONS,
};

export function buildSessions(plan: CoachingPlan): CoachingSession[] {
  return SESSION_TEMPLATES[plan].map((t) => ({
    theme: t.theme,
    goal: t.goal,
    date: "",
    done: false,
    summary: "",
    action: "",
    memo: "",
  }));
}

export function emptyCoaching(): Coaching {
  return { plan: null, paymentStatus: "", startDate: "", sessions: [], report: "" };
}

export function doneCount(coaching: Coaching | undefined): number {
  return coaching?.sessions?.filter((s) => s.done).length ?? 0;
}

export function formatYen(n: number): string {
  return "¥" + n.toLocaleString("ja-JP");
}

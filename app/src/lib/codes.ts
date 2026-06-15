/* =========================================================
   4軸 ⇄ 4文字コード（仕様確定・data.jsx から値・式を変えずに移植）
   ========================================================= */
import type { AxisKey, AxisScores } from "./types";
import { TYPES, type TypeDef } from "../data/typesCatalog";

export interface AxisDef {
  key: AxisKey;
  theme: string;
  pos: { letter: string; label: string };
  neg: { letter: string; label: string };
  desc: string;
}

// 正本: 職業タイプ診断 仕様書（type-test-spec）/ type-test の軸定義と一致
export const AXES: AxisDef[] = [
  { key: "axis1", theme: "才能", pos: { letter: "S", label: "戦略" }, neg: { letter: "E", label: "共感" }, desc: "論理・全体設計で力を出す「戦略」寄りか、人の気持ちへの感度で力を出す「共感」寄りか。" },
  { key: "axis2", theme: "働き方", pos: { letter: "T", label: "チーム" }, neg: { letter: "L", label: "個人" }, desc: "人と関わることでエネルギーが湧く「チーム」寄りか、ひとりの集中で成果が出る「個人」寄りか。" },
  { key: "axis3", theme: "判断", pos: { letter: "O", label: "論理" }, neg: { letter: "I", label: "直感" }, desc: "根拠と筋道で決める「論理」寄りか、第一印象や感覚で決める「直感」寄りか。" },
  { key: "axis4", theme: "構え", pos: { letter: "P", label: "楽観" }, neg: { letter: "C", label: "悲観" }, desc: "まず可能性を見る「楽観」寄りか、まずリスクを見る「悲観（慎重）」寄りか。" },
];

/** score(-10..+10) + 10 = 0..20 -> "0..9 A..K" */
export const CODE_CHARS = "0123456789ABCDEFGHIJK";

export function scoreToChar(s: number): string {
  return CODE_CHARS[Math.max(0, Math.min(20, Math.round(s) + 10))];
}

export function charToScore(c: string): number | null {
  const i = CODE_CHARS.indexOf((c || "").toUpperCase());
  return i < 0 ? null : i - 10;
}

/** 4軸スコア -> 結果コード（例: {axis..} -> "DH8F"） */
export function scoresToCode(test: AxisScores): string {
  return AXES.map((a) => scoreToChar(test[a.key] ?? 0)).join("");
}

/** 結果コード -> 4軸スコア（不正なら null） */
export function codeToScores(code: string): AxisScores | null {
  const c = (code || "").toUpperCase().replace(/[^0-9A-K]/g, "");
  if (c.length !== 4) return null;
  const out: AxisScores = {};
  for (let i = 0; i < 4; i++) {
    const s = charToScore(c[i]);
    if (s === null) return null;
    out[AXES[i].key] = s;
  }
  return out;
}

/** スコア -> タイプコード（SETL… の判定文字列） */
export function scoresToTypeCode(test: AxisScores): string {
  return AXES.map((a) => ((test[a.key] ?? 0) >= 0 ? a.pos.letter : a.neg.letter)).join("");
}

export interface ResolvedType extends TypeDef {
  code: string;
}

/** 4軸スコアからタイプを解決（未診断なら null） */
export function typeOf(test: AxisScores | null | undefined): ResolvedType | null {
  if (!test) return null;
  const has = (["axis1", "axis2", "axis3", "axis4"] as AxisKey[]).some(
    (k) => typeof test[k] === "number"
  );
  if (!has) return null;
  const code = scoresToTypeCode(test);
  const def = TYPES[code];
  if (!def) return null;
  return { code, ...def };
}

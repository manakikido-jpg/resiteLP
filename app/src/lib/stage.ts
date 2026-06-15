/* =========================================================
   集客ファネルのステージ定義
   無料体験予約 → 体験完了 →（決済）→ コーチング中 → 完了 ／ 見送り
   ========================================================= */
import type { CandidateStage } from "./types";
import type { Tone } from "./assessment";

export interface StageDef {
  key: CandidateStage;
  tone: Tone;
}

/** 本線（カンバンの列・ステップバーに並ぶ4段） */
export const STAGES: StageDef[] = [
  { key: "無料体験予約", tone: "info" },
  { key: "体験完了", tone: "cyan" },
  { key: "コーチング中", tone: "warn" },
  { key: "完了", tone: "good" },
];

/** 本線から外れる離脱ステージ */
export const LOST_STAGE: StageDef = { key: "見送り", tone: "muted" };

export const ALL_STAGES: StageDef[] = [...STAGES, LOST_STAGE];

export const STAGE_TONE: Record<string, Tone> = Object.fromEntries(
  ALL_STAGES.map((s) => [s.key, s.tone])
) as Record<string, Tone>;

export const DEFAULT_STAGE: CandidateStage = "無料体験予約";

export function stageOf(c: { stage?: CandidateStage }): CandidateStage {
  return c.stage ?? DEFAULT_STAGE;
}

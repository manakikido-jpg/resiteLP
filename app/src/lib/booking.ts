/* =========================================================
   予約フォーム送信 → 候補者＋予定 生成（プロファイル連携の心臓部）
   予約ページ・プロファイルの「フォーム連携デモ」の両方が使う。
   ========================================================= */
import type { Appointment, Candidate, WebhookPayload } from "./types";
import { blankCandidate } from "./candidate";
import { codeToScores } from "./codes";

export interface BookingRecords {
  candidate: Candidate;
  appointment: Appointment;
}

/** Webhookペイロード → 候補者（基本情報）＋ 予定（source:"form"） */
export function buildBookingRecords(payload: WebhookPayload): BookingRecords {
  // 診断の連携コードがあれば、4軸スコアへデコードして候補者の適性テスト結果に反映
  const test = payload.testCode ? codeToScores(payload.testCode) || {} : {};
  const candidate = blankCandidate({
    name: payload.name,
    phone: payload.phone,
    exp: payload.exp || "なし",
    age: payload.age,
    job: payload.job,
    loc: payload.loc,
    src: payload.src || "予約フォーム",
    date: (payload.scheduledAt || "").slice(0, 10),
    coach: payload.coach || "",
    test,
  });
  const appointment: Appointment = {
    id: crypto.randomUUID(),
    candidateId: candidate.id,
    name: payload.name,
    type: payload.interviewType || "first",
    coach: payload.coach || "未割当",
    at: payload.scheduledAt,
    status: "予定",
    source: "form",
  };
  return { candidate, appointment };
}

/* =========================================================
   Googleカレンダー「予定を追加」リンク生成
   - 認証・バックエンド不要。コーチがログイン中のGoogleアカウント
     （＝そのコーチのカレンダー）に、面談日時だけを登録できる。
   - 件名は最小限（面談：候補者名・面談種別）、本文に担当コーチのみ。
   ========================================================= */
import type { Appointment } from "./types";
import { APPT_TYPES } from "./datetime";

/** Date → Googleカレンダーの dates 形式（UTC: YYYYMMDDTHHMMSSZ） */
function toGCalUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/**
 * 予定 → Googleカレンダーの「予定作成」テンプレートURL。
 * @param appt    対象の予定（at は ISO 文字列）
 * @param minutes セッション長（form_config の slotMinutes）
 * @returns URL（at が不正なら空文字）
 */
export function googleCalendarUrl(appt: Appointment, minutes: number): string {
  const start = new Date(appt.at);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + minutes * 60000);
  const title = `面談：${appt.name || "候補者"}（${APPT_TYPES[appt.type] || ""}）`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGCalUTC(start)}/${toGCalUTC(end)}`,
  });
  if (appt.coach) params.set("details", `担当コーチ: ${appt.coach}`);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* =========================================================
   予約ページの空き枠ロジック — form_config（時間枠設定）＋既存予定 から生成
   プロファイルの「時間枠設定」が、そのまま予約ページの空き状況を制御する。
   ========================================================= */
import type { Appointment, SlotConfig } from "../lib/types";
import { sampleSlotTimes } from "../lib/slots";

/** 年月日（m は 1〜12） */
export interface YMD {
  y: number;
  m: number;
  d: number;
}

export type DayStatus = "past" | "closed" | "full" | "open";

const pad2 = (n: number) => String(n).padStart(2, "0");
export const ymdStr = (p: YMD) => `${p.y}-${pad2(p.m)}-${pad2(p.d)}`;
const toDate = (p: YMD) => new Date(p.y, p.m - 1, p.d);

export function todayParts(): YMD {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
}

export interface Slot {
  t: string;
  ok: boolean;
}

/** その日の枠リスト（capacity・過去時刻・既存予定を加味） */
export function slotsForDate(p: YMD, config: SlotConfig, appts: Appointment[]): Slot[] {
  const dow = toDate(p).getDay();
  const w = config.weekly[dow];
  if (!w || !w.on) return [];
  const dateStr = ymdStr(p);
  const now = Date.now();
  return sampleSlotTimes(dow, config, 24).map((t) => {
    const iso = `${dateStr}T${t}:00+09:00`;
    const taken = appts.filter(
      (a) => a.status !== "キャンセル" && (a.at || "").startsWith(`${dateStr}T${t}`)
    ).length;
    const ok = taken < config.capacity && new Date(iso).getTime() > now;
    return { t, ok };
  });
}

/** その日の予約可否 */
export function dayStatus(p: YMD, config: SlotConfig, appts: Appointment[]): DayStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((toDate(p).getTime() - today.getTime()) / 86400000);
  if (diffDays < config.leadDays) return "past"; // 受付開始前（過去・本日含む）
  if (diffDays > config.rangeDays) return "closed"; // 受付期間外
  const dow = toDate(p).getDay();
  if (!config.weekly[dow]?.on) return "closed";
  if (config.holidays.includes(ymdStr(p))) return "closed";
  const slots = slotsForDate(p, config, appts);
  if (!slots.some((s) => s.ok)) return "full";
  return "open";
}

/* =========================================================
   予約ページの空き枠ロジック — form_config（時間枠設定）＋既存予約件数 から生成
   プロファイルの「時間枠設定」が、そのまま予約ページの空き状況を制御する。

   件数は「予約済み件数のマップ」で受け取る（SlotUsage）。
   以前は Appointment[] を受け取っていたが、匿名ロールには appointments の
   SELECT 権が無いため常に空配列が渡り、全枠が「空き」に見えていた（R-007）。
   氏名・電話を匿名に渡さずに満枠を判定するため、件数だけを扱う形にしている。
   ========================================================= */
import type { Appointment, SlotConfig } from "../lib/types";
import { sampleSlotTimes } from "../lib/slots";

/** 年月日（m は 1〜12） */
export interface YMD {
  y: number;
  m: number;
  d: number;
}

/** 枠キー "YYYY-MM-DDTHH:mm" -> 予約済み件数 */
export type SlotUsage = Record<string, number>;

export type DayStatus = "past" | "closed" | "full" | "open";

const pad2 = (n: number) => String(n).padStart(2, "0");
export const ymdStr = (p: YMD) => `${p.y}-${pad2(p.m)}-${pad2(p.d)}`;
const toDate = (p: YMD) => new Date(p.y, p.m - 1, p.d);

/** 枠キー（サーバの slot_counts が返すキーと同じ形式） */
export const slotKey = (dateStr: string, time: string) => `${dateStr}T${time}`;

export function todayParts(): YMD {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
}

/** 予約一覧 → 枠ごとの件数（localStorageモード用。Supabase接続時は slot_counts RPC を使う） */
export function usageFromAppointments(appts: Appointment[]): SlotUsage {
  const out: SlotUsage = {};
  for (const a of appts) {
    if (a.status === "キャンセル") continue;
    // at は "YYYY-MM-DDTHH:mm:ss+09:00"。先頭16文字が枠キーと同じ形式になる
    const key = (a.at || "").slice(0, 16);
    if (key.length !== 16) continue;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

export interface Slot {
  t: string;
  ok: boolean;
}

/** その日の枠リスト（capacity・過去時刻・既存予約件数を加味） */
export function slotsForDate(
  p: YMD,
  config: SlotConfig,
  usage: SlotUsage,
  now: number = Date.now()
): Slot[] {
  const dow = toDate(p).getDay();
  const w = config.weekly[dow];
  if (!w || !w.on) return [];
  const dateStr = ymdStr(p);
  const capacity = Math.max(1, config.capacity ?? 1);
  return sampleSlotTimes(dow, config, 24).map((t) => {
    const taken = usage[slotKey(dateStr, t)] ?? 0;
    const iso = `${dateStr}T${t}:00+09:00`;
    const ok = taken < capacity && new Date(iso).getTime() > now;
    return { t, ok };
  });
}

/** その日の予約可否 */
export function dayStatus(
  p: YMD,
  config: SlotConfig,
  usage: SlotUsage,
  now: Date = new Date()
): DayStatus {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((toDate(p).getTime() - today.getTime()) / 86400000);
  if (diffDays < config.leadDays) return "past"; // 受付開始前（過去・本日含む）
  if (diffDays > config.rangeDays) return "closed"; // 受付期間外
  const dow = toDate(p).getDay();
  if (!config.weekly[dow]?.on) return "closed";
  if (config.holidays.includes(ymdStr(p))) return "closed";
  const slots = slotsForDate(p, config, usage, now.getTime());
  if (!slots.some((s) => s.ok)) return "full";
  return "open";
}

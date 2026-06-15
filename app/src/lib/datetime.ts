/* =========================================================
   日付ユーティリティ + 予定セレクタ（schedule-data.jsx から移植）
   外部ライブラリ不使用
   ========================================================= */
import type { Appointment, ApptType } from "./types";
import type { Tone } from "./assessment";

export const APPT_TYPES: Record<ApptType, string> = { first: "第一面談", second: "第二面談" };

export interface ApptStatusDef {
  key: Appointment["status"];
  tone: Tone;
}

export const APPT_STATUSES: ApptStatusDef[] = [
  { key: "予定", tone: "info" },
  { key: "完了", tone: "good" },
  { key: "キャンセル", tone: "muted" },
];

export const APPT_STATUS_TONE: Record<string, Tone> = Object.fromEntries(
  APPT_STATUSES.map((s) => [s.key, s.tone])
) as Record<string, Tone>;

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const pad2 = (n: number) => String(n).padStart(2, "0");

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
export function parseAt(iso: string | null | undefined): Date | null {
  return iso ? new Date(iso) : null;
}
export function sameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a && !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function fmtTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
export function fmtDateJP(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
}
export function fmtMonthJP(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

/** 月グリッド（日曜始まり・6週ぶん） */
export function monthGrid(d: Date): Date[][] {
  const first = startOfMonth(d);
  const start = startOfWeek(first);
  const weeks: Date[][] = [];
  let cur = start;
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(cur);
      cur = addDays(cur, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

const byAtAsc = (a: Appointment, b: Appointment) =>
  new Date(a.at).getTime() - new Date(b.at).getTime();

export function apptsForDay(appts: Appointment[], date: Date): Appointment[] {
  return appts
    .filter((a) => {
      const t = parseAt(a.at);
      return t && sameDay(t, date);
    })
    .sort(byAtAsc);
}
export function sortAppts(appts: Appointment[]): Appointment[] {
  return [...appts].sort(byAtAsc);
}

/** 候補者の主要予約（直近の「予定」、なければ最新） */
export function primaryApptFor(appts: Appointment[], candidateId: string): Appointment | null {
  const mine = appts.filter((a) => a.candidateId === candidateId);
  if (!mine.length) return null;
  const upcoming = mine.filter((a) => a.status === "予定").sort(byAtAsc);
  if (upcoming.length) return upcoming[0];
  return [...mine].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
}
export function apptsOfCandidate(appts: Appointment[], candidateId: string): Appointment[] {
  return appts.filter((a) => a.candidateId === candidateId).sort(byAtAsc);
}

/** ISO(+09:00) <-> datetime-local("YYYY-MM-DDTHH:mm") */
export function isoToLocal(iso: string | null | undefined): string {
  const d = parseAt(iso);
  if (!d) return "";
  return `${ymd(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
export function localToIso(local: string): string {
  if (!local) return "";
  return `${local}:00+09:00`;
}

/* 予約ページの静的データ・整形ヘルパ（reference/booking-shared.jsx から移植） */
import type { YMD } from "./availability";

export const MONTH_LABEL_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_JP = ["日", "月", "火", "水", "木", "金", "土"];

export function fmtDate(d: YMD | null): string | null {
  if (!d) return null;
  const dow = DOW_JP[new Date(d.y, d.m - 1, d.d).getDay()];
  return `${d.y}年${d.m}月${d.d}日(${dow})`;
}

/** 開始時刻 + セッション分 → "14:00 – 14:45" */
export function slotRange(t: string, minutes: number): string {
  const [h, m] = t.split(":").map(Number);
  const tot = h * 60 + m + minutes;
  const eh = Math.floor(tot / 60);
  const em = tot % 60;
  return `${t} – ${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

/** 当日の流れ（45分セッションのタイムテーブル） */
export const TIMETABLE = [
  { t: "00:00", h: "チェックイン", p: "雑談ベースで近況とお悩みのざっくりした輪郭を共有。" },
  { t: "05:00", h: "現在地のヒアリング", p: "仕事内容・人間関係・年収・キャリア観を構造化して整理。" },
  { t: "18:00", h: "選択肢の棚卸し", p: "転職・社内異動・現職継続を含めて、取りうる道筋を一緒に書き出します。" },
  { t: "32:00", h: "次の一歩", p: "今日明日からの具体アクションを3つに絞って言語化します。" },
  { t: "40:00", h: "質疑・クロージング", p: "継続支援が必要かを判断する時間。勧誘は一切ありません。" },
];

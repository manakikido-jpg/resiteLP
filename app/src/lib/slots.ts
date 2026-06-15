/* =========================================================
   フォーム項目型・時間枠ロジック（form-data.jsx から移植）
   ========================================================= */
import type { FieldType, MapKey, SlotConfig } from "./types";

export interface FieldTypeDef {
  value: FieldType;
  label: string;
}

export const FIELD_TYPES: FieldTypeDef[] = [
  { value: "text", label: "1行テキスト" },
  { value: "tel", label: "電話番号" },
  { value: "email", label: "メールアドレス" },
  { value: "select", label: "選択肢（プルダウン）" },
  { value: "radio", label: "選択肢（ラジオ）" },
  { value: "textarea", label: "複数行テキスト" },
];

export const FIELD_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  FIELD_TYPES.map((t) => [t.value, t.label])
);

/** Webhookに連携されるキー（候補者・予定に自動マッピング） */
export const MAPPED_KEYS: Record<MapKey, string> = {
  name: "氏名",
  phone: "電話番号",
  exp: "転職経験",
  age: "年齢",
  job: "現在の職業",
  loc: "住まい",
  interviewType: "面談種別",
};

export interface SlotMinutesOption {
  value: number;
  label: string;
}

export const SLOT_MINUTES_OPTIONS: SlotMinutesOption[] = [
  { value: 30, label: "30分" },
  { value: 45, label: "45分" },
  { value: 60, label: "60分" },
  { value: 90, label: "90分" },
];

/** 受付時間帯から、その曜日に生成される枠数 */
export function slotsPerDay(weekday: number, config: SlotConfig): number {
  const w = config.weekly[weekday];
  if (!w || !w.on) return 0;
  const [sh, sm] = w.start.split(":").map(Number);
  const [eh, em] = w.end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return 0;
  return Math.floor(mins / config.slotMinutes);
}

/** 指定曜日のサンプル開始時刻リスト（プレビュー用） */
export function sampleSlotTimes(weekday: number, config: SlotConfig, max = 12): string[] {
  const w = config.weekly[weekday];
  if (!w || !w.on) return [];
  const [sh, sm] = w.start.split(":").map(Number);
  const [eh, em] = w.end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const out: string[] = [];
  for (let m = startMin; m + config.slotMinutes <= endMin && out.length < max; m += config.slotMinutes) {
    out.push(
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
    );
  }
  return out;
}

export function newFieldId(): string {
  return "f_" + Math.random().toString(36).slice(2, 8);
}

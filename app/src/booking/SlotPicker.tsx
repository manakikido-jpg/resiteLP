/* 時間枠ピッカー（reference/booking-shared.jsx の SlotPicker を移植） */
import type { SlotConfig } from "../lib/types";
import { type SlotUsage, type YMD, slotsForDate } from "./availability";

interface SlotPickerProps {
  date: YMD | null;
  picked: string | null;
  onPick: (t: string) => void;
  config: SlotConfig;
  usage: SlotUsage;
}

export function SlotPicker({ date, picked, onPick, config, usage }: SlotPickerProps) {
  if (!date) return null;
  const slots = slotsForDate(date, config, usage);
  if (slots.length === 0) {
    return <div className="slots-empty">この日は受付がありません。別の日をお選びください。</div>;
  }
  return (
    <div className="slots">
      {slots.map((s) => {
        const sel = picked === s.t;
        const cls = ["slot"];
        if (!s.ok) cls.push("disabled");
        if (sel) cls.push("selected");
        return (
          <div key={s.t} className={cls.join(" ")} onClick={() => s.ok && onPick(s.t)}>
            {s.t}
          </div>
        );
      })}
    </div>
  );
}

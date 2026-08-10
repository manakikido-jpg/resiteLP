/* 予約カレンダー（reference/booking-shared.jsx の Calendar を移植・form_config駆動） */
import type { SlotConfig } from "../lib/types";
import { type DayStatus, type SlotUsage, type YMD, dayStatus, todayParts } from "./availability";
import { DOW_EN, MONTH_LABEL_EN } from "./data";

interface CalendarProps {
  y: number;
  m: number; // 1-12
  selected: YMD | null;
  onSelect: (d: YMD) => void;
  onMonth: (dir: number) => void;
  canPrev?: boolean;
  config: SlotConfig;
  usage: SlotUsage;
}

export function Calendar({ y, m, selected, onSelect, onMonth, canPrev = true, config, usage }: CalendarProps) {
  const startDow = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayParts();

  return (
    <div className="cal">
      <div className="cal-hd">
        <div className="cal-month">
          <span className="num">
            {y}.{String(m).padStart(2, "0")}
          </span>
          {MONTH_LABEL_EN[m - 1]}
        </div>
        <div className="cal-nav">
          <button onClick={() => onMonth(-1)} aria-label="前の月" disabled={!canPrev}>
            ‹
          </button>
          <button onClick={() => onMonth(1)} aria-label="次の月">
            ›
          </button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW_EN.map((d, i) => (
          <div key={d} className={`cal-dow${i === 0 ? " sun" : ""}${i === 6 ? " sat" : ""}`}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="cal-day dim" />;
          const status: DayStatus = dayStatus({ y, m, d }, config, usage);
          const isToday = y === today.y && m === today.m && d === today.d;
          const isSel = !!selected && selected.y === y && selected.m === m && selected.d === d;
          const cls = ["cal-day"];
          if (isToday) cls.push("today");
          if (status === "past" || status === "closed" || status === "full") cls.push("disabled");
          else cls.push("has-slots");
          if (isSel) cls.push("selected");
          return (
            <div
              key={i}
              className={cls.join(" ")}
              onClick={() => {
                if (status === "open") onSelect({ y, m, d });
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

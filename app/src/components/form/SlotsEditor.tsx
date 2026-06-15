/* 予約フォーム管理 — 時間枠設定タブ ＋ 空き枠プレビュー */
import type { SlotConfig } from "../../lib/types";
import { SLOT_MINUTES_OPTIONS, sampleSlotTimes, slotsPerDay } from "../../lib/slots";
import { WEEKDAYS, addDays, fmtDateJP, ymd } from "../../lib/datetime";
import { Icon } from "../ui/Icon";
import { Switch } from "../ui/primitives";

const FORM_TODAY = new Date(2026, 5, 4); // デモ基準日（2026-06-04）

type Updater = (prev: SlotConfig) => SlotConfig;

export function SlotsEditor({
  config,
  setConfig,
}: {
  config: SlotConfig;
  setConfig: (u: Updater) => void;
}) {
  const upd = (patch: Partial<SlotConfig>) => setConfig((c) => ({ ...c, ...patch }));
  const updDay = (wd: number, patch: Partial<SlotConfig["weekly"][number]>) =>
    setConfig((c) => ({ ...c, weekly: { ...c.weekly, [wd]: { ...c.weekly[wd], ...patch } } }));
  const addHoliday = () => setConfig((c) => ({ ...c, holidays: [...c.holidays, ymd(FORM_TODAY)] }));
  const setHoliday = (i: number, v: string) =>
    setConfig((c) => ({ ...c, holidays: c.holidays.map((h, idx) => (idx === i ? v : h)) }));
  const delHoliday = (i: number) =>
    setConfig((c) => ({ ...c, holidays: c.holidays.filter((_, idx) => idx !== i) }));

  return (
    <div className="slots-editor">
      <div className="se-block">
        <div className="se-head">
          <h3>曜日ごとの受付時間帯</h3>
          <span className="se-hint">受付する曜日と時間帯を設定します</span>
        </div>
        <div className="weekrows">
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
            const w = config.weekly[wd];
            const count = slotsPerDay(wd, config);
            return (
              <div key={wd} className={"weekrow" + (w.on ? "" : " off")}>
                <span className={"wr-day" + (wd === 0 ? " sun" : wd === 6 ? " sat" : "")}>{WEEKDAYS[wd]}</span>
                <Switch on={w.on} onChange={(v) => updDay(wd, { on: v })} label={w.on ? "受付" : "休"} />
                <div className="wr-times">
                  <input
                    className="input"
                    type="time"
                    value={w.start}
                    disabled={!w.on}
                    onChange={(e) => updDay(wd, { start: e.target.value })}
                  />
                  <span className="wr-tilde">〜</span>
                  <input
                    className="input"
                    type="time"
                    value={w.end}
                    disabled={!w.on}
                    onChange={(e) => updDay(wd, { end: e.target.value })}
                  />
                </div>
                <span className="wr-count">{w.on ? `${count} 枠` : "—"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="se-block">
        <div className="se-head">
          <h3>枠の条件</h3>
        </div>
        <div className="se-grid">
          <label className="se-field">
            <span>1枠の長さ</span>
            <select
              className="select"
              value={config.slotMinutes}
              onChange={(e) => upd({ slotMinutes: Number(e.target.value) })}
            >
              {SLOT_MINUTES_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="se-field">
            <span>1枠あたりの予約上限</span>
            <div className="stepper">
              <button onClick={() => upd({ capacity: Math.max(1, config.capacity - 1) })}>−</button>
              <span>{config.capacity} 名</span>
              <button onClick={() => upd({ capacity: config.capacity + 1 })}>＋</button>
            </div>
          </label>
        </div>
      </div>

      <div className="se-block">
        <div className="se-head">
          <h3>予約可能期間</h3>
        </div>
        <div className="period-row">
          <span>受付開始</span>
          <input
            className="input num"
            type="number"
            min="0"
            value={config.leadDays}
            onChange={(e) => upd({ leadDays: Math.max(0, Number(e.target.value)) })}
          />
          <span>日後から</span>
          <span className="period-sep">〜</span>
          <input
            className="input num"
            type="number"
            min="1"
            value={config.rangeDays}
            onChange={(e) => upd({ rangeDays: Math.max(1, Number(e.target.value)) })}
          />
          <span>日先まで</span>
        </div>
      </div>

      <div className="se-block">
        <div className="se-head">
          <h3>休止日（受付しない日）</h3>
        </div>
        <div className="holidays">
          {config.holidays.length === 0 && (
            <p className="muted" style={{ fontSize: 13 }}>
              休止日は設定されていません。
            </p>
          )}
          {config.holidays.map((h, i) => (
            <div key={i} className="holiday-row">
              <Icon name="cal" size={14} />
              <input className="input" type="date" value={h} onChange={(e) => setHoliday(i, e.target.value)} />
              <button className="opt-del" onClick={() => delHoliday(i)} title="削除">
                <Icon name="x" size={15} />
              </button>
            </div>
          ))}
          <button className="btn btn-sm btn-ghost" onClick={addHoliday}>
            <Icon name="plus" size={14} />
            休止日を追加
          </button>
        </div>
      </div>
    </div>
  );
}

function upcomingBookable(config: SlotConfig, maxDays = 3) {
  const out: { date: Date; times: string[] }[] = [];
  const holidays = new Set(config.holidays);
  for (let off = config.leadDays; off <= config.rangeDays && out.length < maxDays; off++) {
    const d = addDays(FORM_TODAY, off);
    const wd = d.getDay();
    if (!config.weekly[wd]?.on) continue;
    if (holidays.has(ymd(d))) continue;
    const times = sampleSlotTimes(wd, config, 8);
    if (times.length) out.push({ date: d, times });
  }
  return out;
}

export function SlotPreview({ config }: { config: SlotConfig }) {
  const days = upcomingBookable(config, 3);
  const openDays = [1, 2, 3, 4, 5, 6, 0].filter((wd) => config.weekly[wd]?.on).length;
  const maxSlots = Math.max(...[0, 1, 2, 3, 4, 5, 6].map((wd) => slotsPerDay(wd, config)));
  return (
    <div className="form-preview">
      <div className="fp-brand">
        <img src="/assets/logo-mark.png" alt="" />
        <span>面談日時の選択</span>
      </div>
      <div className="slot-summary">
        <div>
          <b>{openDays}</b>
          <span>受付曜日 / 週</span>
        </div>
        <div>
          <b>
            {config.slotMinutes}
            <small>分</small>
          </b>
          <span>1枠の長さ</span>
        </div>
        <div>
          <b>{maxSlots}</b>
          <span>最大枠 / 日</span>
        </div>
      </div>
      <p className="fp-lead">
        ご希望の日時をお選びください（受付：{config.leadDays}日後〜{config.rangeDays}日先）
      </p>
      <div className="slot-days">
        {days.length === 0 && (
          <p className="muted" style={{ fontSize: 13 }}>
            条件に合う空き枠がありません。受付曜日や期間をご確認ください。
          </p>
        )}
        {days.map((d, i) => (
          <div key={i} className="slot-day">
            <div className="sd-head">{fmtDateJP(d.date)}</div>
            <div className="sd-chips">
              {d.times.map((t) => (
                <span key={t} className="sd-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

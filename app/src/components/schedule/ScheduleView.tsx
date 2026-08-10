/* スケジュール画面 — カレンダー(月/週/日) + リスト + 予定編集 */
import { useMemo, useState, type ReactNode } from "react";
import { useApp } from "../../store/AppStore";
import type { Appointment } from "../../lib/types";
import {
  APPT_STATUS_TONE,
  APPT_STATUSES,
  APPT_TYPES,
  WEEKDAYS,
  addDays,
  apptsForDay,
  fmtDateJP,
  fmtMonthJP,
  fmtTime,
  monthGrid,
  parseAt,
  sameDay,
  sortAppts,
  startOfWeek,
  ymd,
} from "../../lib/datetime";
import { googleCalendarUrl } from "../../lib/gcal";
import { isSupabaseConfigured } from "../../lib/supabase";
import { AppBar } from "../AppBar";
import { Icon } from "../ui/Icon";
import { Avatar, Field, Saver, Select, TextInput } from "../ui/primitives";

/**
 * 「今日」は必ず実時刻から取る。
 * ここは以前 `new Date(2026, 5, 3)` のデモ固定値になっており、
 * コーチがスケジュールを開くと常に過去の月が表示されていた（R-001）。
 * モジュール定数にすると同じ事故を再発させるので、呼び出しごとに評価する。
 */
const today = () => new Date();
const isToday = (d: Date) => sameDay(d, today());

function Modal({
  title,
  onClose,
  children,
  width = 460,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ApptChip({ a, onClick, compact }: { a: Appointment; onClick: (e: React.MouseEvent) => void; compact?: boolean }) {
  const tone = APPT_STATUS_TONE[a.status] || "info";
  const t = parseAt(a.at)!;
  return (
    <button
      className={"appt-chip tone-" + tone + (a.status === "キャンセル" ? " is-cancel" : "")}
      onClick={onClick}
      title={`${a.name}・${APPT_TYPES[a.type]}`}
    >
      <span className="ac-dot" />
      {!compact && <span className="ac-time">{fmtTime(t)}</span>}
      <span className="ac-name">{a.name}</span>
    </button>
  );
}

function ApptEdit({
  a,
  presetDate,
  onClose,
}: {
  a?: Appointment;
  presetDate?: string;
  onClose: () => void;
}) {
  const { candidates, upsertAppt, removeAppt, notify, navigate, slotConfig } = useApp();
  const init: Appointment =
    a || {
      id: crypto.randomUUID(),
      candidateId: null,
      name: "",
      type: "first",
      coach: "",
      at: `${presetDate || ymd(today())}T10:00:00+09:00`,
      status: "予定",
      source: "manual",
      memo: "",
    };
  const at0 = parseAt(init.at) || today();
  const [name, setName] = useState(init.name);
  const [candidateId, setCandidateId] = useState(init.candidateId || "");
  const [type, setType] = useState(init.type);
  const [coach, setCoach] = useState(init.coach);
  const [date, setDate] = useState(ymd(at0));
  const [time, setTime] = useState(fmtTime(at0));
  const [status, setStatus] = useState(init.status);

  const linkedCand = candidateId ? candidates.find((x) => x.id === candidateId) : undefined;
  const pickCandidate = (id: string) => {
    setCandidateId(id);
    const c = candidates.find((x) => x.id === id);
    if (c) {
      setName(c.name);
      if (c.coach) setCoach(c.coach);
    }
  };

  const build = (): Appointment => ({
    ...init,
    name: name || "（無題）",
    candidateId: candidateId || null,
    type,
    coach,
    at: `${date}T${time || "10:00"}:00+09:00`,
    status,
  });
  const save = () => {
    upsertAppt(build());
    notify(linkedCand ? "候補者の確認ページに反映されました" : "予定を保存しました");
    onClose();
  };
  const del = () => {
    if (window.confirm("この予定を削除しますか？この操作は取り消せません。")) {
      removeAppt(init.id);
      notify("予定を削除しました");
      onClose();
    }
  };
  const gcalUrl = googleCalendarUrl(build(), slotConfig?.slotMinutes ?? 60);

  return (
    <Modal title={a ? "予定を編集" : "予定を追加"} onClose={onClose} width={500}>
      {linkedCand && (
        <button className="appt-candlink" onClick={() => navigate({ name: "profile", id: candidateId })}>
          <Avatar name={linkedCand.name} size={34} />
          <span className="acl-main">
            <b>{linkedCand.name}</b>
            <small>プロファイルを開く</small>
          </span>
          <Icon name="arrowRight" size={16} />
        </button>
      )}
      <div className="form-grid">
        {!linkedCand && (
          <Field label="候補者をリンク" full>
            <Select
              value={candidateId}
              onChange={pickCandidate}
              placeholder="（リンクなし・手動入力）"
              options={candidates.map((c) => ({ value: c.id, label: c.name || "（氏名未入力）" }))}
            />
          </Field>
        )}
        {!linkedCand && (
          <Field label="候補者名" full>
            <TextInput value={name} onChange={setName} placeholder="氏名" />
          </Field>
        )}
        <Field label="面談日時" full>
          <div className="dt-row">
            <TextInput type="date" value={date} onChange={setDate} />
            <TextInput type="time" value={time} onChange={setTime} />
          </div>
        </Field>
        <Field label="面談種別">
          <Select
            value={type}
            onChange={(v) => setType(v as Appointment["type"])}
            options={[
              { value: "first", label: "第一面談" },
              { value: "second", label: "第二面談" },
            ]}
          />
        </Field>
        <Field label="担当コーチ">
          <TextInput value={coach} onChange={setCoach} placeholder="森田 涼介" />
        </Field>
        <Field label="ステータス" full>
          <Select value={status} onChange={(v) => setStatus(v as Appointment["status"])} options={APPT_STATUSES.map((s) => s.key)} />
        </Field>
      </div>
      {gcalUrl && (
        <a className="gcal-link" href={gcalUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="cal" size={15} />
          Googleカレンダーに追加（コーチのカレンダー）
        </a>
      )}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        {a ? (
          <button className="btn btn-ghost btn-sm" onClick={del} style={{ color: "#c0492f" }}>
            <Icon name="trash" size={14} />
            削除
          </button>
        ) : (
          <span />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={onClose}>
            閉じる
          </button>
          <button className="btn btn-primary" onClick={save}>
            保存
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MonthView({
  cursor,
  appts,
  onAppt,
  onAddOn,
}: {
  cursor: Date;
  appts: Appointment[];
  onAppt: (a: Appointment) => void;
  onAddOn: (dateStr: string) => void;
}) {
  const weeks = monthGrid(cursor);
  const mo = cursor.getMonth();
  return (
    <div className="cal-month">
      <div className="cal-weekhead">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={"cal-wd" + (i === 0 ? " sun" : i === 6 ? " sat" : "")}>
            {w}
          </div>
        ))}
      </div>
      <div className="cal-grid">
        {weeks.map((row) =>
          row.map((d) => {
            const dayAppts = apptsForDay(appts, d);
            const out = d.getMonth() !== mo;
            return (
              <div
                key={d.toISOString()}
                className={"cal-cell" + (out ? " out" : "") + (isToday(d) ? " today" : "")}
                onClick={() => onAddOn(ymd(d))}
              >
                <div className="cal-date">
                  <span className={"cal-dnum" + (d.getDay() === 0 ? " sun" : d.getDay() === 6 ? " sat" : "")}>
                    {d.getDate()}
                  </span>
                  {isToday(d) && <span className="cal-today-tag">今日</span>}
                </div>
                <div className="cal-cell-appts">
                  {dayAppts.slice(0, 3).map((a) => (
                    <ApptChip
                      key={a.id}
                      a={a}
                      compact
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppt(a);
                      }}
                    />
                  ))}
                  {dayAppts.length > 3 && <div className="cal-more">+{dayAppts.length - 3} 件</div>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function WeekView({
  cursor,
  appts,
  onAppt,
  onAddOn,
}: {
  cursor: Date;
  appts: Appointment[];
  onAppt: (a: Appointment) => void;
  onAddOn: (dateStr: string) => void;
}) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <div className="cal-week">
      {days.map((d) => {
        const dayAppts = apptsForDay(appts, d);
        return (
          <div key={d.toISOString()} className={"week-col" + (isToday(d) ? " today" : "")}>
            <div className="week-colhead">
              <span className={"wd" + (d.getDay() === 0 ? " sun" : d.getDay() === 6 ? " sat" : "")}>
                {WEEKDAYS[d.getDay()]}
              </span>
              <span className={"wn" + (isToday(d) ? " today" : "")}>{d.getDate()}</span>
            </div>
            <div className="week-colbody" onClick={() => onAddOn(ymd(d))}>
              {dayAppts.length === 0 && <div className="week-empty">—</div>}
              {dayAppts.map((a) => (
                <button
                  key={a.id}
                  className={"week-appt tone-" + APPT_STATUS_TONE[a.status] + (a.status === "キャンセル" ? " is-cancel" : "")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppt(a);
                  }}
                >
                  <span className="wa-time">{fmtTime(parseAt(a.at)!)}</span>
                  <span className="wa-name">{a.name}</span>
                  <span className="wa-type">{APPT_TYPES[a.type]}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ApptRow({
  a,
  onAppt,
  onEdit,
}: {
  a: Appointment;
  onAppt: (a: Appointment) => void;
  onEdit?: (a: Appointment) => void;
}) {
  const t = parseAt(a.at)!;
  const tone = APPT_STATUS_TONE[a.status];
  return (
    <div className={"appt-row" + (a.status === "キャンセル" ? " is-cancel" : "")}>
      <button className="ar-click" onClick={() => onAppt(a)} title="候補者プロファイルを開く">
        <div className="ar-time">
          <span className="ar-hm">{fmtTime(t)}</span>
          <span className="ar-md">
            {t.getMonth() + 1}/{t.getDate()}
          </span>
        </div>
        <div className={"ar-bar tone-" + tone} />
        <div className="ar-main">
          <div className="ar-name">
            {a.name}
            <span className="badge badge-type">{APPT_TYPES[a.type]}</span>
          </div>
          <div className="ar-sub">
            <Icon name="user" size={13} />
            {a.coach || "未割当"}
            {a.source === "form" && <span className="ar-form">フォーム受付</span>}
          </div>
        </div>
        <span className={"status tone-" + tone}>
          <span className="status-dot" />
          {a.status}
        </span>
      </button>
      {onEdit && (
        <button className="ar-edit" onClick={() => onEdit(a)} title="予定を編集">
          <Icon name="edit" size={16} />
        </button>
      )}
    </div>
  );
}

function DayView({
  cursor,
  appts,
  onAppt,
  onEdit,
  onAddOn,
}: {
  cursor: Date;
  appts: Appointment[];
  onAppt: (a: Appointment) => void;
  onEdit: (a: Appointment) => void;
  onAddOn: (dateStr: string) => void;
}) {
  const dayAppts = apptsForDay(appts, cursor);
  return (
    <div className="cal-day">
      <div className="day-head">
        <h3>{fmtDateJP(cursor)}</h3>
        <button className="btn btn-sm" onClick={() => onAddOn(ymd(cursor))}>
          <Icon name="plus" size={14} />
          この日に追加
        </button>
      </div>
      {dayAppts.length === 0 ? (
        <div className="empty-state" style={{ padding: "48px 20px" }}>
          <b>予定はありません</b>「この日に追加」から登録できます。
        </div>
      ) : (
        <div className="day-list">
          {dayAppts.map((a) => (
            <ApptRow key={a.id} a={a} onAppt={onAppt} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

function SchedListView({
  appts,
  onAppt,
  onEdit,
}: {
  appts: Appointment[];
  onAppt: (a: Appointment) => void;
  onEdit: (a: Appointment) => void;
}) {
  const groups = useMemo(() => {
    const sorted = sortAppts(appts);
    const m = new Map<string, Appointment[]>();
    for (const a of sorted) {
      const key = (a.at || "").slice(0, 10);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(a);
    }
    return [...m.entries()];
  }, [appts]);

  return (
    <div className="sched-list">
      {groups.map(([day, items]) => {
        const d = new Date(day + "T00:00:00");
        return (
          <div key={day} className="sched-group">
            <div className={"sched-group-head" + (isToday(d) ? " today" : "")}>
              {fmtDateJP(d)}
              {isToday(d) && <span className="cal-today-tag">今日</span>}
            </div>
            <div className="day-list">
              {items.map((a) => (
                <ApptRow key={a.id} a={a} onAppt={onAppt} onEdit={onEdit} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type EditState = { a?: Appointment; presetDate?: string } | null;

export function ScheduleView() {
  const { appts, saving, simulateWebhook, navigate, notify, candidates } = useApp();
  const [mode, setMode] = useState<"calendar" | "list">("calendar");
  const [calMode, setCalMode] = useState<"month" | "week" | "day">("month");
  // 初期表示は「今日」。useState の初期化関数にして毎レンダーの再生成を避ける
  const [cursor, setCursor] = useState<Date>(() => today());
  const [edit, setEdit] = useState<EditState>(null);

  const step = (dir: number) => {
    if (mode === "list" || calMode === "month") {
      setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));
    } else if (calMode === "week") {
      setCursor((c) => addDays(c, dir * 7));
    } else {
      setCursor((c) => addDays(c, dir));
    }
  };
  const label =
    mode === "list"
      ? "すべての予定"
      : calMode === "day"
        ? fmtDateJP(cursor)
        : calMode === "week"
          ? `${fmtMonthJP(startOfWeek(cursor))} 第${Math.ceil(cursor.getDate() / 7)}週`
          : fmtMonthJP(cursor);

  const openAppt = (a: Appointment) => {
    if (a.candidateId && candidates.some((c) => c.id === a.candidateId)) {
      navigate({ name: "profile", id: a.candidateId });
    } else {
      setEdit({ a });
    }
  };
  const editAppt = (a: Appointment) => setEdit({ a });
  const addOn = (dateStr: string) => setEdit({ presetDate: dateStr });

  /**
   * 予約フォーム受信のデモ取り込み。
   * 押すと候補者と予定が実際に1件作られるため、Supabase接続時（＝本番）では出さない。
   * 以前は本番のスケジュール画面に常設されており、押すと架空の「藤井 結衣」が
   * 本番DBに登録される状態だった（R-004）。
   */
  const showDemo = !isSupabaseConfigured;
  const runDemo = () => {
    const p = {
      name: "デモ 太郎",
      phone: "090-0000-0000",
      exp: "1回",
      age: "27",
      job: "事務（保険）",
      loc: "東京都江東区",
      // 固定日を置くと今日から離れた月に飛ぶため、常に翌日の10:30にする
      scheduledAt: `${ymd(addDays(today(), 1))}T10:30:00+09:00`,
      interviewType: "first" as const,
      coach: "",
    };
    const { appt } = simulateWebhook(p);
    setCursor(parseAt(appt.at)!);
    notify(`予約フォームから「${p.name}」さんを取り込みました（デモ）`);
  };

  return (
    <>
      <AppBar right={<Saver saving={saving} />} />

      <main className="page" data-screen-label="スケジュール">
        <div className="home-head">
          <div>
            <div className="eyebrow">Schedule</div>
            <h1>スケジュール</h1>
            <p>面談予定を管理します。予約フォームからの予定は自動で登録されます。</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {showDemo && (
              <button className="btn" onClick={runDemo} title="予約フォーム送信をシミュレート（ローカル環境のみ）">
                <Icon name="bolt" size={15} />
                フォーム連携をデモ
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setEdit({})}>
              <Icon name="plus" size={16} />
              予定を追加
            </button>
          </div>
        </div>

        <div className="sched-toolbar">
          <div className="sched-nav">
            <button className="btn-icon btn" onClick={() => step(-1)}>
              <Icon name="chevL" size={18} />
            </button>
            <button className="btn btn-sm" onClick={() => setCursor(today())}>
              今日
            </button>
            <button className="btn-icon btn" onClick={() => step(1)}>
              <Icon name="chevR" size={18} />
            </button>
            <span className="sched-label">{label}</span>
          </div>
          <div className="sched-modes">
            {mode === "calendar" && (
              <div className="seg-switch">
                {(
                  [
                    ["month", "月"],
                    ["week", "週"],
                    ["day", "日"],
                  ] as ["month" | "week" | "day", string][]
                ).map(([k, l]) => (
                  <button key={k} className={calMode === k ? "on" : ""} onClick={() => setCalMode(k)}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            <div className="seg-switch">
              <button className={mode === "calendar" ? "on" : ""} onClick={() => setMode("calendar")}>
                <Icon name="grid" size={14} />
                カレンダー
              </button>
              <button className={mode === "list" ? "on" : ""} onClick={() => setMode("list")}>
                <Icon name="list" size={14} />
                リスト
              </button>
            </div>
          </div>
        </div>

        <div className="sched-stage">
          {mode === "list" ? (
            <SchedListView appts={appts} onAppt={openAppt} onEdit={editAppt} />
          ) : calMode === "month" ? (
            <MonthView cursor={cursor} appts={appts} onAppt={openAppt} onAddOn={addOn} />
          ) : calMode === "week" ? (
            <WeekView cursor={cursor} appts={appts} onAppt={openAppt} onAddOn={addOn} />
          ) : (
            <DayView cursor={cursor} appts={appts} onAppt={openAppt} onEdit={editAppt} onAddOn={addOn} />
          )}
        </div>

        <div className="note-box" style={{ marginTop: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon name="bolt" size={16} />
          <div>
            <b>予約フォーム連携（Webhook）</b>
            　候補者がフォームを送信すると、基本情報と面談予定が自動登録され、候補者プロファイルも自動生成されます。
            {showDemo && "「フォーム連携をデモ」で取り込みの流れを確認できます（ローカル環境のみ表示）。"}
          </div>
        </div>
      </main>

      {edit && <ApptEdit a={edit.a} presetDate={edit.presetDate} onClose={() => setEdit(null)} />}
    </>
  );
}

/* =========================================================
   面談予約ページ（公開）— reference/booking-A.jsx を移植
   ・フォーム項目は form_config.fields から動的描画（プロファイルと連携）
   ・空き枠は form_config.slots ＋ 既存予定から生成
   ・セッション長は slotMinutes 連動／「無料」表記は一切なし
   ========================================================= */
import { useEffect, useMemo, useState } from "react";
import type { Appointment, FormField, FormConfig, WebhookPayload } from "../lib/types";
import { repository } from "../store/repository";
import { buildBookingRecords } from "../lib/booking";
import { codeToScores, typeOf } from "../lib/codes";
import { Calendar } from "./Calendar";
import { SlotPicker } from "./SlotPicker";
import { type YMD, ymdStr, todayParts } from "./availability";
import { TIMETABLE, fmtDate, slotRange } from "./data";

// TODO: 本番では LP（v4_white.html 等）の本番URLに差し替え
const LP_URL = "/";

type FieldValues = Record<string, string>;

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        className="inp"
        rows={3}
        placeholder={field.placeholder || ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select className="inp" value={value} onChange={(e) => onChange(e.target.value)} required={field.required}>
        <option value="" disabled>
          {field.placeholder || "選択してください"}
        </option>
        {(field.options || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "radio") {
    return (
      <div className="chips">
        {(field.options || []).map((o) => (
          <div
            key={o}
            className={`chip ${value === o ? "selected" : ""}`}
            onClick={() => onChange(value === o ? "" : o)}
          >
            {o}
          </div>
        ))}
      </div>
    );
  }
  return (
    <input
      className="inp"
      type={field.type === "email" ? "email" : "text"}
      inputMode={field.type === "tel" ? "tel" : undefined}
      placeholder={field.placeholder || ""}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function BookingApp() {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [appts, setAppts] = useState<Appointment[]>([]);

  // 職業タイプ診断から ?code= で引き継がれた連携コード（あれば候補者の適性テストへ反映）
  const carriedCode = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get("code") || "";
    return codeToScores(raw) ? raw.toUpperCase() : "";
  }, []);
  const carriedType = useMemo(
    () => (carriedCode ? typeOf(codeToScores(carriedCode)) : null),
    [carriedCode]
  );

  const today = todayParts();
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  const [date, setDate] = useState<YMD | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [values, setValues] = useState<FieldValues>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    repository
      .loadAll()
      .then((d) => {
        if (!active) return;
        setConfig(d.formConfig);
        setAppts(d.appts);
      })
      .catch((e) => console.error("loadAll failed", e));
    return () => {
      active = false;
    };
  }, []);

  const fields = config?.fields ?? [];
  const slotMinutes = config?.slots.slotMinutes ?? 45;

  const requiredOk = useMemo(
    () => fields.filter((f) => f.required).every((f) => (values[f.id] || "").trim() !== ""),
    [fields, values]
  );
  const stepDate = !!date;
  const stepTime = stepDate && !!time;
  const stepInfo = stepTime && requiredOk;

  const onMonth = (dir: number) =>
    setYm((prev) => {
      let m = prev.m + dir;
      let y = prev.y;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      if (y < today.y || (y === today.y && m < today.m)) return prev;
      return { y, m };
    });
  const canPrev = !(ym.y === today.y && ym.m === today.m);

  const setVal = (id: string, v: string) => setValues((prev) => ({ ...prev, [id]: v }));
  const byMap = (key: string): string => {
    const f = fields.find((x) => x.mapKey === key);
    return f ? values[f.id] || "" : "";
  };

  const submit = async () => {
    if (!stepInfo || !date || !time || submitting) return;
    setSubmitting(true);
    const scheduledAt = `${ymdStr(date)}T${time}:00+09:00`;
    const payload: WebhookPayload = {
      name: byMap("name"),
      phone: byMap("phone"),
      exp: byMap("exp") || "なし",
      age: byMap("age"),
      job: byMap("job"),
      loc: byMap("loc"),
      src: "予約フォーム",
      scheduledAt,
      interviewType: "first",
      testCode: carriedCode || undefined,
    };
    const { candidate, appointment } = buildBookingRecords(payload);
    try {
      await repository.saveCandidate(candidate);
      await repository.saveAppt(appointment);
      setDone(true);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("予約の保存に失敗しました", e);
      alert("予約の保存に失敗しました。お手数ですが時間をおいて再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const Header = (
    <header className="hd">
      <div className="hd-in">
        <a className="hd-logo" href={LP_URL}>
          <img src="/assets/booking-logo.png" alt="可能性LABO" />
        </a>
        <a className="hd-back" href={LP_URL}>
          ← トップへ
        </a>
      </div>
    </header>
  );

  if (!config) {
    return (
      <>
        {Header}
        <div className="A-wrap">
          <div className="A-loading">読み込み中…</div>
        </div>
      </>
    );
  }

  if (done) {
    const nameVal = byMap("name");
    return (
      <>
        {Header}
        <div className="A-wrap">
          <div className="A-done">
            <div className="A-done-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ey">RESERVATION CONFIRMED</div>
            <h2>面談を予約しました。</h2>
            <p>
              確認SMSと、Zoomリンクを記載したメールを送信しました。
              <br />
              当日まで、どうぞお気軽に。
            </p>
            <div className="A-done-card">
              <div className="A-done-row">
                <span>日時</span>
                <span>
                  {fmtDate(date)}
                  <span className="num" style={{ color: "var(--p)", marginLeft: 6 }}>
                    {time}
                  </span>
                </span>
              </div>
              <div className="A-done-row">
                <span>形式</span>
                <span>Zoom（{slotMinutes}分）</span>
              </div>
              <div className="A-done-row">
                <span>お名前</span>
                <span>{nameVal}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {Header}
      <div className="A-wrap">
        <div className="A-pg">
          <div className={`A-pg-step ${stepDate ? "done" : "cur"}`}>
            <span className="A-pg-dot" />
            <span>01 日付</span>
          </div>
          <div className={`A-pg-line ${stepDate ? "done" : ""}`} />
          <div className={`A-pg-step ${stepTime ? "done" : stepDate ? "cur" : ""}`}>
            <span className="A-pg-dot" />
            <span>02 時間</span>
          </div>
          <div className={`A-pg-line ${stepTime ? "done" : ""}`} />
          <div className={`A-pg-step ${stepTime ? "cur" : ""}`}>
            <span className="A-pg-dot" />
            <span>03 連絡先</span>
          </div>
        </div>

        <div className="A-intro">
          <div className="ey">BOOK YOUR SESSION</div>
          <h1>面談を予約する。</h1>
          <p>
            最大{slotMinutes}分・Zoom。
            <br />
            お名前と電話番号だけで完結します。キャンセルは前日までにお願いします。
          </p>
        </div>

        {carriedCode && (
          <div className="A-carry">
            <span className="A-carry-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              職業タイプ診断の結果
              <b>
                {" "}
                {carriedCode}
                {carriedType ? `（${carriedType.name}）` : ""}
              </b>{" "}
              を引き継いで予約します。
            </div>
          </div>
        )}

        {/* 01 — date */}
        <div className="A-block">
          <div className="A-block-hd">
            <span className="num">01</span>
            <h3>日付を選ぶ</h3>
          </div>
          <Calendar
            y={ym.y}
            m={ym.m}
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setTime(null);
            }}
            onMonth={onMonth}
            canPrev={canPrev}
            config={config.slots}
            appts={appts}
          />
        </div>

        {/* 02 — time */}
        {date && (
          <div className="A-block">
            <div className="A-block-hd">
              <span className="num">02</span>
              <h3>時間を選ぶ</h3>
            </div>
            <div className="A-slots-wrap">
              <div className="A-slots-d">
                <span>{fmtDate(date)}</span>
                <span className="dot" />
                <span style={{ color: "var(--ts)", fontSize: ".78rem", fontWeight: 400 }}>空き時間</span>
              </div>
              <SlotPicker date={date} picked={time} onPick={setTime} config={config.slots} appts={appts} />
            </div>
          </div>
        )}

        {/* 03 — info */}
        {date && time && (
          <div className="A-block">
            <div className="A-block-hd">
              <span className="num">03</span>
              <h3>連絡先を入力</h3>
            </div>
            <div className="A-form-grid">
              {fields.map((f) => (
                <div className="fld" key={f.id}>
                  <div className="fld-lab">
                    {f.label} {f.required ? <span className="req">REQ</span> : <span className="opt">任意</span>}
                  </div>
                  <FieldControl field={f} value={values[f.id] || ""} onChange={(v) => setVal(f.id, v)} />
                  {f.help && <div className="fld-help">{f.help}</div>}
                </div>
              ))}
            </div>

            <div className="A-cta">
              <div className="summary">
                <div className="summary-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div className="summary-l">
                  <div className="ey">YOUR SLOT</div>
                  <div className="v">
                    {fmtDate(date)}
                    <span className="num">{slotRange(time, slotMinutes)}</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary" disabled={!stepInfo || submitting} onClick={submit}>
                {submitting ? "送信中…" : "面談を予約する"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
              <div className="A-cta-sub">
                初回{slotMinutes}分 <i>·</i> Zoom <i>·</i> 勧誘なし
              </div>
            </div>
          </div>
        )}

        <details className="A-flow" open={!date}>
          <summary>
            当日の流れ <span className="min">{slotMinutes} MIN</span>
          </summary>
          <ol>
            {TIMETABLE.map((it, i) => (
              <li key={i}>
                <div>
                  <b>
                    {it.h}
                    <span className="min-time">— {it.t}</span>
                  </b>
                  {it.p}
                </div>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </>
  );
}

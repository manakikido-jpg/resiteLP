/* タブ1：基本情報（候補者情報 ＋ 予約情報＝予定と同一実体） */
import { useApp } from "../../../store/AppStore";
import type { TabProps } from "../ProfileView";
import type { Appointment } from "../../../lib/types";
import { Field, TextInput, Select } from "../../ui/primitives";
import { Icon } from "../../ui/Icon";
import { googleCalendarUrl } from "../../../lib/gcal";
import {
  APPT_STATUSES,
  apptsOfCandidate,
  isoToLocal,
  localToIso,
  primaryApptFor,
} from "../../../lib/datetime";

export function TabBasic({ c, set }: TabProps) {
  const { appts, upsertAppt, notify, navigate, slotConfig } = useApp();

  const appt = primaryApptFor(appts, c.id);
  const gcalUrl = appt ? googleCalendarUrl(appt, slotConfig?.slotMinutes ?? 60) : "";
  const others = apptsOfCandidate(appts, c.id).filter((a) => appt && a.id !== appt.id);

  const updAppt = (patch: Partial<Appointment>, opts: { silent?: boolean } = {}) => {
    if (!appt) return;
    upsertAppt({ ...appt, ...patch });
    if (patch.at !== undefined) set(["date"], (patch.at || "").slice(0, 10));
    if (patch.coach !== undefined) set(["coach"], patch.coach);
    if (!opts.silent) notify("候補者の確認ページに反映されました");
  };
  const onStatus = (v: string) => {
    if (appt && v === "キャンセル" && appt.status !== "キャンセル") {
      if (!window.confirm("この予約をキャンセル扱いにしますか？候補者の確認ページにも反映されます。")) return;
    }
    updAppt({ status: v as Appointment["status"] });
  };
  const createAppt = () => {
    const day = c.date || new Date().toISOString().slice(0, 10);
    upsertAppt({
      id: crypto.randomUUID(),
      candidateId: c.id,
      name: c.name || "（無題）",
      type: "first",
      coach: c.coach || "",
      at: `${day}T10:00:00+09:00`,
      status: "予定",
      source: "manual",
      memo: "",
    });
    notify("予約を作成しました");
  };

  return (
    <div className="tabpane">
      {/* ブロック① 候補者情報 */}
      <div className="card" style={{ maxWidth: 880 }}>
        <div className="card-head">
          <span className="sec">01</span>
          <h3>候補者情報</h3>
          <span className="hint">予約フォームからの引き継ぎ情報</span>
        </div>

        <div className="form-grid">
          <Field label="氏名" required>
            <TextInput value={c.name} onChange={(v) => set(["name"], v)} placeholder="山田 太郎" />
          </Field>
          <Field label="電話番号">
            <TextInput value={c.phone} onChange={(v) => set(["phone"], v)} placeholder="090-0000-0000" />
          </Field>

          <Field label="転職経験">
            <Select value={c.exp} onChange={(v) => set(["exp"], v)} options={["なし", "1回", "2回", "3回以上"]} />
          </Field>
          <Field label="年齢">
            <TextInput value={c.age} onChange={(v) => set(["age"], v)} placeholder="28" />
          </Field>

          <Field label="現在の職業">
            <TextInput value={c.job} onChange={(v) => set(["job"], v)} placeholder="法人営業" />
          </Field>
          <Field label="住まい">
            <TextInput value={c.loc} onChange={(v) => set(["loc"], v)} placeholder="東京都新宿区" />
          </Field>

          <Field label="セグメント" required>
            <Select
              value={c.seg}
              onChange={(v) => set(["seg"], v)}
              options={[
                { value: "newgrad", label: "新卒" },
                { value: "career", label: "中途" },
              ]}
            />
          </Field>
          <Field label="流入元">
            <TextInput
              value={c.src}
              onChange={(v) => set(["src"], v)}
              placeholder="Instagram / TikTok / 知人紹介 など"
            />
          </Field>
        </div>

        <div className="note-box" style={{ marginTop: 22 }}>
          <b>セグメント</b>は第一面談タブの設問を切り替えます（新卒／中途）。電話番号・年齢などは予約フォームからの自動引き継ぎを想定しています。
        </div>
      </div>

      {/* ブロック② 予約情報 */}
      <div className="card" style={{ maxWidth: 880, marginTop: 20 }}>
        <div className="card-head">
          <span className="sec">02</span>
          <h3>予約情報</h3>
          <span className="sync-badge">
            <span className="sync-dot" />
            候補者の確認ページに即時反映
          </span>
        </div>

        {appt ? (
          <>
            <div className="form-grid">
              <Field label="面談日時">
                <TextInput
                  type="datetime-local"
                  value={isoToLocal(appt.at)}
                  onChange={(v) => updAppt({ at: localToIso(v) })}
                />
              </Field>
              <Field label="面談種別">
                <Select
                  value={appt.type}
                  onChange={(v) => updAppt({ type: v as Appointment["type"] })}
                  options={[
                    { value: "first", label: "第一面談" },
                    { value: "second", label: "第二面談" },
                  ]}
                />
              </Field>
              <Field label="担当コーチ">
                <TextInput value={appt.coach} onChange={(v) => updAppt({ coach: v })} placeholder="森田 涼介" />
              </Field>
              <Field label="ステータス">
                <Select value={appt.status} onChange={onStatus} options={APPT_STATUSES.map((s) => s.key)} />
              </Field>
            </div>

            <div className="resv-foot">
              <button className="linklike" onClick={() => navigate({ name: "schedule" })}>
                <Icon name="cal" size={14} />
                スケジュールで開く
              </button>
              {gcalUrl && (
                <a className="linklike" href={gcalUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="cal" size={14} />
                  Googleカレンダーに追加
                </a>
              )}
              {others.length > 0 && <span className="resv-other">他に {others.length} 件の予定あり</span>}
            </div>
          </>
        ) : (
          <div className="resv-empty">
            <div>
              <b>予約はまだ登録されていません</b>
              <p>面談日時を登録すると、候補者の確認ページにも表示されます。</p>
            </div>
            <button className="btn btn-primary" onClick={createAppt}>
              <Icon name="plus" size={15} />
              予約を作成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* 予約フォーム管理画面 — 項目タブ / 時間枠タブ ＋ ライブプレビュー */
import { useState } from "react";
import { useApp } from "../../store/AppStore";
import type { FieldType, FormField } from "../../lib/types";
import { FIELD_TYPES, newFieldId } from "../../lib/slots";
import { AppBar } from "../AppBar";
import { Icon } from "../ui/Icon";
import { Saver, Switch } from "../ui/primitives";
import { SlotsEditor, SlotPreview } from "./SlotsEditor";

type SetFields = (u: (prev: FormField[]) => FormField[]) => void;

function OptionsEditor({
  options = [],
  onChange,
}: {
  options?: string[];
  onChange: (opts: string[]) => void;
}) {
  const set = (i: number, v: string) => onChange(options.map((o, idx) => (idx === i ? v : o)));
  const add = () => onChange([...options, `選択肢${options.length + 1}`]);
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  return (
    <div className="opts-editor">
      <div className="opts-label">選択肢</div>
      <div className="opts-list">
        {options.map((o, i) => (
          <div key={i} className="opt-row">
            <span className="opt-bullet" />
            <input className="input opt-input" value={o} onChange={(e) => set(i, e.target.value)} />
            <button className="opt-del" onClick={() => remove(i)} title="削除" disabled={options.length <= 1}>
              <Icon name="x" size={15} />
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-sm btn-ghost" onClick={add}>
        <Icon name="plus" size={14} />
        選択肢を追加
      </button>
    </div>
  );
}

const needsOptions = (t: FieldType) => t === "select" || t === "radio";

function FieldsEditor({ fields, setFields }: { fields: FormField[]; setFields: SetFields }) {
  const update = (id: string, patch: Partial<FormField>) =>
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) => {
    if (window.confirm("この質問を削除しますか？")) setFields((fs) => fs.filter((f) => f.id !== id));
  };
  const move = (id: string, dir: number) =>
    setFields((fs) => {
      const i = fs.findIndex((f) => f.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= fs.length) return fs;
      const next = [...fs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const add = () =>
    setFields((fs) => [
      ...fs,
      { id: newFieldId(), label: "新しい質問", type: "text", required: false, placeholder: "" },
    ]);

  return (
    <div className="fields-editor">
      {fields.map((f, i) => (
        <div key={f.id} className="field-card">
          <div className="fc-head">
            <div className="fc-reorder">
              <button className="fc-move" onClick={() => move(f.id, -1)} disabled={i === 0} title="上へ">
                <Icon name="chevUp" size={15} />
              </button>
              <button
                className="fc-move"
                onClick={() => move(f.id, 1)}
                disabled={i === fields.length - 1}
                title="下へ"
              >
                <Icon name="chevDown" size={15} />
              </button>
            </div>
            <input
              className="fc-label"
              value={f.label}
              onChange={(e) => update(f.id, { label: e.target.value })}
              placeholder="質問のラベル"
            />
            {f.mapKey && (
              <span className="fc-maptag" title="この項目は候補者プロファイル・予定に自動連携されます">
                <Icon name="bolt" size={12} />
                連携
              </span>
            )}
            <button className="fc-del" onClick={() => remove(f.id)} title="質問を削除">
              <Icon name="trash" size={16} />
            </button>
          </div>

          <div className="fc-controls">
            <label className="fc-typesel">
              <span>形式</span>
              <select
                className="select"
                value={f.type}
                onChange={(e) => {
                  const type = e.target.value as FieldType;
                  const patch: Partial<FormField> = { type };
                  if (needsOptions(type) && !f.options) patch.options = ["選択肢1", "選択肢2"];
                  update(f.id, patch);
                }}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <Switch on={f.required} onChange={(v) => update(f.id, { required: v })} label="必須" />
          </div>

          {needsOptions(f.type) && (
            <OptionsEditor options={f.options || []} onChange={(opts) => update(f.id, { options: opts })} />
          )}
        </div>
      ))}
      <button className="btn btn-dashed" onClick={add}>
        <Icon name="plus" size={16} />
        質問を追加
      </button>
    </div>
  );
}

function FormPreview({ fields }: { fields: FormField[] }) {
  return (
    <div className="form-preview">
      <div className="fp-brand">
        <img src="/assets/logo-mark.png" alt="" />
        <span>面談のご予約</span>
      </div>
      <p className="fp-lead">下記フォームにご入力ください。担当コーチよりご連絡します。</p>
      <div className="fp-body">
        {fields.map((f) => (
          <div key={f.id} className="fp-field">
            <label className="fp-label">
              {f.label || "（無題）"}
              {f.required && <span className="fp-req">必須</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea className="fp-input" rows={2} placeholder={f.placeholder || ""} disabled />
            ) : f.type === "select" ? (
              <select className="fp-input" disabled>
                <option>選択してください</option>
                {(f.options || []).map((o, i) => (
                  <option key={i}>{o}</option>
                ))}
              </select>
            ) : f.type === "radio" ? (
              <div className="fp-radios">
                {(f.options || []).map((o, i) => (
                  <span key={i} className="fp-radio">
                    <span className="fp-dot" />
                    {o}
                  </span>
                ))}
              </div>
            ) : (
              <input className="fp-input" placeholder={f.placeholder || ""} disabled />
            )}
          </div>
        ))}
        <div className="fp-field">
          <label className="fp-label">
            ご希望の日時<span className="fp-req">必須</span>
          </label>
          <div className="fp-slotpick">
            <Icon name="cal" size={15} />
            空き枠から選択（時間枠設定に連動）
          </div>
        </div>
        <button className="fp-submit" disabled>
          予約を確定する
        </button>
      </div>
    </div>
  );
}

export function FormBuilderView() {
  const { formFields, setFormFields, slotConfig, setSlotConfig, saving } = useApp();
  const [tab, setTab] = useState<"fields" | "slots">("fields");

  return (
    <>
      <AppBar right={<Saver saving={saving} />} />
      <main className="page" data-screen-label="予約フォーム管理">
        <div className="home-head">
          <div>
            <div className="eyebrow">Booking form</div>
            <h1>予約フォーム管理</h1>
            <p>候補者向けの予約フォームを編集します。変更は保存と同時にフォームへ反映されます。</p>
          </div>
          <span className="rt-pill">
            <span className="sync-dot" />
            フォームにリアルタイム反映
          </span>
        </div>

        <div className="fb-tabs">
          <button className={"fb-tab" + (tab === "fields" ? " on" : "")} onClick={() => setTab("fields")}>
            <Icon name="list" size={16} />
            フォーム項目
          </button>
          <button className={"fb-tab" + (tab === "slots" ? " on" : "")} onClick={() => setTab("slots")}>
            <Icon name="cal" size={16} />
            時間枠設定
          </button>
        </div>

        <div className="fb-layout">
          <div className="fb-editor">
            {tab === "fields" ? (
              <FieldsEditor fields={formFields} setFields={setFormFields} />
            ) : (
              <SlotsEditor config={slotConfig} setConfig={setSlotConfig} />
            )}
          </div>
          <aside className="fb-preview">
            <div className="fb-preview-head">
              <Icon name="search" size={14} />
              プレビュー（候補者の画面）
            </div>
            {tab === "fields" ? <FormPreview fields={formFields} /> : <SlotPreview config={slotConfig} />}
          </aside>
        </div>
      </main>
    </>
  );
}

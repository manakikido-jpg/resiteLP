/* タブ5：コーチ総合所見 / タブ6：送客判断 */
import type { TabProps } from "../ProfileView";
import type { CandidateStatus } from "../../../lib/types";
import { ASMT_ITEMS, STATUSES, asmtTotal } from "../../../lib/assessment";
import { Field, TextInput, TextArea, Select, StarRating } from "../../ui/primitives";
import { Icon } from "../../ui/Icon";

export function TabAssessment({ c, set }: TabProps) {
  const total = asmtTotal(c.asmt);
  return (
    <div className="tabpane">
      <div className="panel-grid">
        <div className="card">
          <div className="card-head">
            <span className="sec">05</span>
            <h3>コーチ総合所見</h3>
            <span className="hint">6つの観点を5段階で評価</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            {ASMT_ITEMS.map((it) => (
              <div className="rating-row" key={it.key}>
                <div className="rating-info">
                  <div className="lbl">{it.label}</div>
                  <div className="desc">{it.desc}</div>
                </div>
                <StarRating value={c.asmt?.[it.key] || 0} onChange={(v) => set(["asmt", it.key], v)} />
                <span className="rating-val">{c.asmt?.[it.key] || 0}/5</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <div className="total-pill">
              <span className="lbl">合計</span>
              <span className="num">{total}</span>
              <span className="max">/ 30</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="sec">
              <Icon name="spark" size={16} />
            </span>
            <h3>自由記述</h3>
            <span className="hint">強み・懸念点・可能性</span>
          </div>
          <TextArea
            value={c.asmt?.notes}
            rows={6}
            placeholder="この方の強み、気になる点、これから伸びそうな可能性などを、可能性の発見の観点で記述します…"
            onChange={(v) => set(["asmt", "notes"], v)}
          />
          <div className="note-box" style={{ marginTop: 16 }}>
            「良し悪しの判定」ではなく「<b>可能性の発見</b>」の観点で記述します。— 可能性ラボのバリュー：正直に伴走する。
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabPlacement({ c, set }: TabProps) {
  return (
    <div className="tabpane">
      <div className="card" style={{ maxWidth: 880 }}>
        <div className="card-head">
          <span className="sec">06</span>
          <h3>送客判断</h3>
          <span className="hint">マッチング先と次アクション</span>
        </div>

        <div className="form-grid">
          <Field label="マッチしそうな業界">
            <TextInput
              value={c.place?.industry}
              onChange={(v) => set(["place", "industry"], v)}
              placeholder="人材 / IT / 小売 など"
            />
          </Field>
          <Field label="マッチしそうな職種">
            <TextInput
              value={c.place?.role}
              onChange={(v) => set(["place", "role"], v)}
              placeholder="法人営業 / CS / 企画 など"
            />
          </Field>

          <Field label="ステータス">
            <Select
              value={c.place?.status}
              onChange={(v) => set(["place", "status"], v as CandidateStatus)}
              options={STATUSES.map((s) => s.key)}
            />
          </Field>
          <Field label="次アクション">
            <TextInput
              value={c.place?.next}
              onChange={(v) => set(["place", "next"], v)}
              placeholder="例：A社の二次面接を調整"
            />
          </Field>

          <Field label="メモ" full>
            <TextArea
              value={c.place?.memo}
              rows={4}
              placeholder="送客の判断根拠、紹介先の状況、留意点など…"
              onChange={(v) => set(["place", "memo"], v)}
            />
          </Field>
        </div>

        <div className="note-box" style={{ marginTop: 20 }}>
          <b>ステータス凡例</b>
          {STATUSES.map((s, i) => (
            <span key={s.key}>
              {i > 0 ? "／" : ""}
              <b>{s.key}</b>＝{s.desc}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

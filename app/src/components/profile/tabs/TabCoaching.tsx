/* タブ7：キャリアコーチング（有料）— プラン・全セッション記録・成果物・完了報告 */
import type { TabProps } from "../ProfileView";
import type { Coaching, CoachingPlan, CoachingSession, PaymentStatus } from "../../../lib/types";
import { PLAN_INFO, buildSessions, doneCount, emptyCoaching, formatYen } from "../../../lib/coaching";
import { Field, TextInput, TextArea, Select } from "../../ui/primitives";
import { Icon } from "../../ui/Icon";

const PLANS: CoachingPlan[] = ["standard", "full"];
const PAYMENTS: PaymentStatus[] = ["未入金", "入金済"];

export function TabCoaching({ c, set }: TabProps) {
  const coaching: Coaching = { ...emptyCoaching(), ...(c.coaching ?? {}) };
  const info = coaching.plan ? PLAN_INFO[coaching.plan] : null;
  const done = doneCount(coaching);
  const total = info?.sessions ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const selectPlan = (plan: CoachingPlan) => {
    if (coaching.plan === plan) return;
    const hasData = coaching.sessions.some(
      (s) => s.date || s.summary || s.action || s.memo || s.done
    );
    if (coaching.plan && hasData) {
      if (!window.confirm("プランを変更するとセッション記録がリセットされます。よろしいですか？")) return;
    }
    set(["coaching"], { ...coaching, plan, sessions: buildSessions(plan) });
  };
  const clearPlan = () => {
    if (window.confirm("コーチング契約を解除しますか？セッション記録も削除されます。")) {
      set(["coaching"], emptyCoaching());
    }
  };
  const setSession = (i: number, patch: Partial<CoachingSession>) => {
    set(
      ["coaching", "sessions"],
      coaching.sessions.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  };

  return (
    <div className="tabpane">
      {/* プラン */}
      <div className="card" style={{ maxWidth: 880 }}>
        <div className="card-head">
          <span className="sec">07</span>
          <h3>キャリアコーチング</h3>
          <span className="hint">有料プランの契約・進捗管理</span>
        </div>

        <div className="plan-pick">
          {PLANS.map((p) => {
            const pi = PLAN_INFO[p];
            const on = coaching.plan === p;
            return (
              <button key={p} className={"plan-card" + (on ? " on" : "")} onClick={() => selectPlan(p)}>
                <div className="plan-name">{pi.label}</div>
                <div className="plan-price">{formatYen(pi.price)}</div>
                <div className="plan-dur">{pi.duration}</div>
              </button>
            );
          })}
        </div>

        {coaching.plan ? (
          <>
            <div className="form-grid" style={{ marginTop: 20 }}>
              <Field label="入金ステータス">
                <Select
                  value={coaching.paymentStatus}
                  onChange={(v) => set(["coaching", "paymentStatus"], v as PaymentStatus)}
                  options={PAYMENTS}
                  placeholder="—"
                />
              </Field>
              <Field label="開始日">
                <TextInput
                  type="date"
                  value={coaching.startDate}
                  onChange={(v) => set(["coaching", "startDate"], v)}
                />
              </Field>
            </div>

            <div className="coach-progress">
              <div className="cp-head">
                <span>進捗</span>
                <b>
                  {done} / {total} 回完了
                </b>
              </div>
              <div className="cp-bar">
                <i style={{ width: pct + "%" }} />
              </div>
            </div>

            {info && (
              <div className="note-box" style={{ marginTop: 16 }}>
                <b>成果物</b>　{info.deliverables.join(" ／ ")}
                <button className="linklike" style={{ marginLeft: 12 }} onClick={clearPlan}>
                  <Icon name="trash" size={13} />
                  契約を解除
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="note-box" style={{ marginTop: 18 }}>
            プランを選択すると、マニュアルのセッション構成（{PLAN_INFO.standard.sessions}回／{PLAN_INFO.full.sessions}回）が自動でセットされます。
          </div>
        )}
      </div>

      {/* セッション記録 */}
      {coaching.plan &&
        coaching.sessions.map((s, i) => (
          <div className="card coach-session" key={i} style={{ maxWidth: 880, marginTop: 16 }}>
            <div className="cs-head">
              <span className={"cs-no" + (s.done ? " done" : "")}>{String(i + 1).padStart(2, "0")}</span>
              <div className="cs-title">
                <b>{s.theme}</b>
                <span>{s.goal}</span>
              </div>
              <label className="cs-done">
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={(e) => setSession(i, { done: e.target.checked })}
                />
                実施済
              </label>
            </div>

            <div className="form-grid">
              <Field label="実施日">
                <TextInput type="date" value={s.date} onChange={(v) => setSession(i, { date: v })} />
              </Field>
              <Field label="次回までのアクション">
                <TextInput
                  value={s.action}
                  onChange={(v) => setSession(i, { action: v })}
                  placeholder="クライアントが次回までにやること"
                />
              </Field>
              <Field label="内容サマリー（3〜5行）" full>
                <TextArea
                  value={s.summary}
                  rows={3}
                  onChange={(v) => setSession(i, { summary: v })}
                  placeholder="セッションで話した内容のサマリー…"
                />
              </Field>
              <Field label="コーチ所感・懸念事項" full>
                <TextArea
                  value={s.memo}
                  rows={2}
                  onChange={(v) => setSession(i, { memo: v })}
                  placeholder="気になった点・懸念があれば…"
                />
              </Field>
            </div>
          </div>
        ))}

      {/* 完了報告 */}
      {coaching.plan && (
        <div className="card" style={{ maxWidth: 880, marginTop: 16 }}>
          <div className="card-head">
            <span className="sec">
              <Icon name="check" size={16} />
            </span>
            <h3>完了報告・総括</h3>
            <span className="hint">全セッション終了後に記入</span>
          </div>
          <TextArea
            value={coaching.report}
            rows={4}
            onChange={(v) => set(["coaching", "report"], v)}
            placeholder="クライアントの状況・転職支援サービスへの接続可否・総括など…"
          />
        </div>
      )}
    </div>
  );
}

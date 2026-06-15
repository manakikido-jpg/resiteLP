/* タブ2：第一面談（セグメント別） / タブ3：第二面談（共通） */
import type { TabProps } from "../ProfileView";
import type { InterviewNotes } from "../../../lib/types";
import { INTERVIEW1, INTERVIEW2, type QABlockDef } from "../../../lib/interview";
import { TextArea } from "../../ui/primitives";

function QABlock({
  block,
  store,
  set,
  root,
}: {
  block: QABlockDef;
  store: InterviewNotes;
  set: TabProps["set"];
  root: "i1" | "i2";
}) {
  const anyFilled = block.qs.some((q) => (store?.[q.f] || "").trim() !== "");
  return (
    <div className="qa-block">
      <div className="qa-sec-head">
        <span className="qa-sec-no">{block.sec}</span>
        <h4>{block.title}</h4>
        {anyFilled && <span className="filled-dot" title="入力あり" />}
      </div>
      <div className="qa">
        {block.qs.map((q, i) => (
          <div className="qa-item" key={q.f}>
            <div className="qa-q">
              <span className="qn">Q{i + 1}</span>
              <span className="qt">{q.q}</span>
            </div>
            <TextArea
              value={store?.[q.f]}
              rows={2}
              placeholder="面談メモを入力…"
              onChange={(v) => set([root, q.f], v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabInterview1({ c, set }: TabProps) {
  const blocks = INTERVIEW1[c.seg] || INTERVIEW1.career;
  return (
    <div className="tabpane">
      <div className="card" style={{ maxWidth: 880 }}>
        <div className="card-head">
          <span className="sec">02</span>
          <h3>第一面談</h3>
          <span className="hint">設問はテンプレとして常に表示されます</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <span className="muted" style={{ fontSize: 13 }}>
            表示するセグメント
          </span>
          <div className="seg-switch">
            <button className={c.seg === "newgrad" ? "on" : ""} onClick={() => set(["seg"], "newgrad")}>
              新卒
            </button>
            <button className={c.seg === "career" ? "on" : ""} onClick={() => set(["seg"], "career")}>
              中途
            </button>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>
            ※ 基本情報のセグメントと連動します
          </span>
        </div>

        {blocks.map((b) => (
          <QABlock key={b.sec + b.title} block={b} store={c.i1} set={set} root="i1" />
        ))}
      </div>
    </div>
  );
}

export function TabInterview2({ c, set }: TabProps) {
  return (
    <div className="tabpane">
      <div className="card" style={{ maxWidth: 880 }}>
        <div className="card-head">
          <span className="sec">03</span>
          <h3>第二面談</h3>
          <span className="hint">新卒・中途 共通</span>
        </div>
        {INTERVIEW2.map((b) => (
          <QABlock key={b.sec + b.title} block={b} store={c.i2} set={set} root="i2" />
        ))}
      </div>
    </div>
  );
}

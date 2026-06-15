/* タブ4：適性テスト結果（4文字コード入力 → 4軸スコア自動セット） */
import { useState } from "react";
import type { TabProps } from "../ProfileView";
import type { AxisScores } from "../../../lib/types";
import { AXES, type AxisDef, codeToScores, scoresToCode, typeOf } from "../../../lib/codes";
import { Icon } from "../../ui/Icon";

function AxisBar({
  axis,
  value,
  onChange,
}: {
  axis: AxisDef;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const v = typeof value === "number" ? value : 0;
  const pct = ((v + 10) / 20) * 100;
  let grad: string;
  if (v >= 0) {
    grad = `linear-gradient(90deg, #e6edf2 0%, #e6edf2 50%, #1786c0 50%, #1f63a0 ${pct}%, #e6edf2 ${pct}%, #e6edf2 100%)`;
  } else {
    grad = `linear-gradient(90deg, #e6edf2 0%, #e6edf2 ${pct}%, #1786c0 ${pct}%, #1f63a0 50%, #e6edf2 50%, #e6edf2 100%)`;
  }
  const posActive = v >= 0;
  const negActive = v < 0;
  return (
    <div className="axis-row">
      <div className="axis-labels">
        <span className={"axis-pole" + (posActive ? " active" : "")}>
          <span className="pl">{axis.pos.letter}</span>
          {axis.pos.label}
        </span>
        <span className="axis-theme">{axis.theme}</span>
        <span className={"axis-pole" + (negActive ? " active" : "")}>
          {axis.neg.label}
          <span className="pl">{axis.neg.letter}</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="range"
          className="axis-slider"
          min={-10}
          max={10}
          step={1}
          value={v}
          style={{ background: grad, borderRadius: 999 }}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
        />
        <span className="axis-score">{v > 0 ? "+" + v : v}</span>
      </div>
    </div>
  );
}

function TypeResult({ test }: { test: AxisScores }) {
  const t = typeOf(test);
  if (!t) return null;
  const letters = AXES.map((a) => {
    const s = test[a.key] ?? 0;
    const pos = s >= 0;
    return { L: pos ? a.pos.letter : a.neg.letter, p: pos ? a.pos.label : a.neg.label };
  });
  return (
    <div className="typeresult">
      <div className="typeresult-hero">
        <div className="tr-codeline">
          {letters.map((l, i) => (
            <div className="tr-letter" key={i}>
              <span className="L">{l.L}</span>
              <span className="p">{l.p}</span>
            </div>
          ))}
        </div>
        <div className="tr-name">{t.name}</div>
        <div className="tr-en">
          {t.code} ・ {t.en}
        </div>
      </div>
      <div className="tr-body">
        <div className="tr-blurb">{t.blurb}</div>
        <ul className="tr-feats">
          {t.feats.map((f, i) => (
            <li key={i}>
              <b>{f.title}</b>
              <span>{f.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TabAptitude({ c, set }: TabProps) {
  const t = typeOf(c.test);
  const currentCode = t ? scoresToCode(c.test) : "";
  const [code, setCode] = useState(currentCode);
  const [err, setErr] = useState("");
  const [justLoaded, setJustLoaded] = useState(false);

  const load = () => {
    const scores = codeToScores(code);
    if (!scores) {
      setErr("4文字コードが正しくありません（0〜9・A〜K の4文字）");
      return;
    }
    setErr("");
    set(["test"], scores);
    setJustLoaded(true);
    setTimeout(() => setJustLoaded(false), 1800);
  };

  const setAxis = (key: string, v: number) => set(["test", key], v);

  return (
    <div className="tabpane">
      <div className="panel-grid">
        <div className="card">
          <div className="card-head">
            <span className="sec">04</span>
            <h3>適性テスト結果</h3>
            <span className="hint">診断アプリの4文字コードを入力</span>
          </div>

          <div className="code-entry">
            <div className="code-input-wrap">
              <label className="eyebrow" style={{ color: "var(--ink-2)" }}>
                結果コード
              </label>
              <input
                className="code-input"
                maxLength={4}
                value={code}
                placeholder="DH8F"
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/[^0-9A-K]/g, ""));
                  setErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </div>
            <button className="btn btn-primary" style={{ height: 50 }} onClick={load}>
              <Icon name="download" size={16} />
              読み込む
            </button>
            {justLoaded && (
              <span className="saver" style={{ color: "var(--t-good-fg)" }}>
                <Icon name="check" size={15} />
                スコアをセットしました
              </span>
            )}
          </div>
          {err && (
            <div className="code-err" style={{ marginTop: 10 }}>
              {err}
            </div>
          )}

          <div className="note-box" style={{ marginTop: 18 }}>
            候補者が職業タイプ診断（type-test）を受けると、結果ページに<b>コーチ連携コード（4文字）</b>が表示されます。
            面談時に候補者から受け取ったそのコードをここに入力すると、4軸スコアが自動でセットされ、診断と<b>同一のタイプ</b>が判定されます。
            各文字はスコア（−10〜+10）を <b>0〜9 / A〜K</b> の1文字にエンコードしたものです。
          </div>
        </div>

        {t ? (
          <>
            <TypeResult test={c.test} />

            <div className="card">
              <div className="card-head">
                <span className="sec">軸</span>
                <h3>4軸スコア</h3>
                <span className="hint">コードから自動セット／スライダーで手動修正も可能</span>
              </div>
              <div className="axes">
                {AXES.map((a) => (
                  <AxisBar key={a.key} axis={a} value={c.test[a.key]} onChange={(v) => setAxis(a.key, v)} />
                ))}
              </div>
              <div className="note-box" style={{ marginTop: 22 }}>
                スコアは各軸 <b>−10〜+10</b>。<b>0以上</b>で左の極（コード文字）、<b>0未満</b>で右の極になります。
                現在の結果コード：
                <b style={{ fontFamily: "var(--mono)", letterSpacing: ".1em" }}>{currentCode}</b>
                ／ タイプコード：
                <b style={{ fontFamily: "var(--mono)", letterSpacing: ".1em" }}>{t.code}</b>
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <div className="empty-state" style={{ border: "none", background: "none", padding: "40px 20px" }}>
              <b>まだ診断結果がありません</b>
              上の入力欄に診断アプリの4文字コードを入力して「読み込む」を押してください。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

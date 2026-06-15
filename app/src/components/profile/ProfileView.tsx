/* プロファイル枠 — ヘッダー + 6タブナビ */
import { useState } from "react";
import { useApp } from "../../store/AppStore";
import type { Candidate } from "../../lib/types";
import { asmtTotal } from "../../lib/assessment";
import { typeOf } from "../../lib/codes";
import { LOST_STAGE, STAGES, stageOf } from "../../lib/stage";
import type { CandidateStage } from "../../lib/types";
import { AppBar } from "../AppBar";
import { Icon } from "../ui/Icon";
import { Avatar, SegBadge, StatusBadge, Saver, val } from "../ui/primitives";
import { TabBasic } from "./tabs/TabBasic";
import { TabInterview1, TabInterview2 } from "./tabs/TabInterview";
import { TabAptitude } from "./tabs/TabAptitude";
import { TabAssessment, TabPlacement } from "./tabs/TabAssessment";
import { TabCoaching } from "./tabs/TabCoaching";

export type SetField = (path: string[], value: unknown) => void;
export interface TabProps {
  c: Candidate;
  set: SetField;
}

type TabKey = "basic" | "i1" | "i2" | "aptitude" | "asmt" | "place" | "coaching";

const TAB_DEFS: { key: TabKey; label: string; Comp: (p: TabProps) => JSX.Element }[] = [
  { key: "basic", label: "基本情報", Comp: TabBasic },
  { key: "i1", label: "第一面談", Comp: TabInterview1 },
  { key: "i2", label: "第二面談", Comp: TabInterview2 },
  { key: "aptitude", label: "適性テスト", Comp: TabAptitude },
  { key: "asmt", label: "総合所見", Comp: TabAssessment },
  { key: "place", label: "送客判断", Comp: TabPlacement },
  { key: "coaching", label: "コーチング", Comp: TabCoaching },
];

function tabHasContent(c: Candidate, key: TabKey): boolean {
  const filled = (o: Record<string, unknown> | undefined) =>
    !!o && Object.values(o).some((v) => typeof v === "string" && v.trim() !== "");
  if (key === "i1") return filled(c.i1);
  if (key === "i2") return filled(c.i2);
  if (key === "aptitude") return !!typeOf(c.test);
  if (key === "asmt") return asmtTotal(c.asmt) > 0 || (c.asmt?.notes || "").trim() !== "";
  if (key === "place") return !!(c.place?.industry || c.place?.role || c.place?.next || c.place?.memo);
  if (key === "coaching") return !!c.coaching?.plan;
  return false;
}

export function ProfileView({ id }: { id: string }) {
  const { candidates, setField, saving, navigate, removeCandidate } = useApp();
  const [tab, setTab] = useState<TabKey>("basic");
  const c = candidates.find((x) => x.id === id);

  if (!c) {
    return (
      <>
        <AppBar right={<Saver saving={saving} />} />
        <main className="page">
          <div className="empty-state">
            <b>候補者が見つかりません</b>
            一覧に戻ってください。
          </div>
        </main>
      </>
    );
  }

  const set: SetField = (path, value) => setField(id, path, value);
  const score = asmtTotal(c.asmt);
  const t = typeOf(c.test);
  const def = TAB_DEFS.find((d) => d.key === tab)!;
  const TabComp = def.Comp;

  const onDelete = () => {
    if (window.confirm(`「${c.name || "この候補者"}」を削除しますか？この操作は取り消せません。`)) {
      removeCandidate(id);
    }
  };

  const curStage = stageOf(c);
  const curIdx = STAGES.findIndex((s) => s.key === curStage);
  const setStage = (s: CandidateStage) => setField(id, ["stage"], s);

  return (
    <>
      <AppBar
        right={
          <>
            <Saver saving={saving} />
            <button className="btn btn-ghost btn-sm" onClick={onDelete}>
              削除
            </button>
          </>
        }
      />

      <div className="prof-head-wrap" data-screen-label={"候補者プロファイル：" + (c.name || "")}>
        <div className="prof-head">
          <button className="backlink" onClick={() => navigate({ name: "list" })}>
            <Icon name="back" size={15} />
            候補者一覧へ戻る
          </button>

          <div className="identity">
            <Avatar name={c.name} size={56} />
            <div className="identity-main">
              <h1>
                {c.name || "（氏名未入力）"}
                <SegBadge seg={c.seg} />
                <StatusBadge status={c.place?.status} />
              </h1>
              <div className="identity-meta">
                <span>
                  <Icon name="briefcase" size={14} />
                  {val(c.job, "職業未入力")}
                </span>
                <span>
                  <Icon name="user" size={14} />
                  {c.age ? `${c.age}歳` : val("")}・転職{c.exp}
                </span>
                <span>
                  <Icon name="pin" size={14} />
                  {val(c.loc, "住まい未入力")}
                </span>
                <span>
                  <Icon name="cal" size={14} />
                  面談 {val(c.date)}
                </span>
                <span>
                  <Icon name="user" size={14} />
                  担当 {val(c.coach)}
                </span>
              </div>
            </div>
            <div className="identity-side">
              <div className="kpi">
                <div className="k">総合スコア</div>
                <div className="v">
                  {score > 0 ? score : "—"}
                  <small>{score > 0 ? " /30" : ""}</small>
                </div>
              </div>
              <div className="kpi">
                <div className="k">タイプ</div>
                <div
                  className="v"
                  style={{ fontFamily: "var(--mono)", letterSpacing: ".08em", fontSize: 20 }}
                >
                  {t ? t.code : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="stage-bar">
            {STAGES.map((s, i) => (
              <button
                key={s.key}
                className={
                  "stage-step" +
                  (curStage === s.key ? " on" : "") +
                  (curIdx >= 0 && i < curIdx ? " done" : "")
                }
                onClick={() => setStage(s.key)}
              >
                <span className="ss-dot" />
                {s.key}
              </button>
            ))}
            <button
              className={"stage-lost" + (curStage === LOST_STAGE.key ? " on" : "")}
              onClick={() => setStage(LOST_STAGE.key)}
            >
              {LOST_STAGE.key}
            </button>
          </div>

          <nav className="tabs">
            {TAB_DEFS.map((d, i) => (
              <button
                key={d.key}
                className={"tab" + (tab === d.key ? " is-active" : "")}
                onClick={() => setTab(d.key)}
              >
                <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
                {d.label}
                {tabHasContent(c, d.key) && <span className="tdot" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <TabComp c={c} set={set} />
    </>
  );
}

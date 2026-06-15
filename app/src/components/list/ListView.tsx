/* 候補者一覧（ホーム）— カンバン/リスト切替・ステージ運用 */
import { useMemo, useState } from "react";
import { useApp } from "../../store/AppStore";
import type { Candidate, CandidateStage, Segment } from "../../lib/types";
import { asmtTotal } from "../../lib/assessment";
import { ALL_STAGES, STAGES, stageOf } from "../../lib/stage";
import { typeOf } from "../../lib/codes";
import { PLAN_INFO, doneCount } from "../../lib/coaching";
import { AppBar } from "../AppBar";
import { Icon } from "../ui/Icon";
import { Avatar, SegBadge, StageBadge, StatusBadge, TypeChip, Saver } from "../ui/primitives";

function planLabel(c: Candidate): string | null {
  const plan = c.coaching?.plan;
  if (!plan) return null;
  return `${PLAN_INFO[plan].label} ${doneCount(c.coaching)}/${PLAN_INFO[plan].sessions}`;
}

function CandidateCard({ c, onOpen }: { c: Candidate; onOpen: () => void }) {
  const score = asmtTotal(c.asmt);
  const plan = planLabel(c);
  return (
    <button className="ccard" onClick={onOpen}>
      <div className="ccard-top">
        <Avatar name={c.name} />
        <div className="ccard-id">
          <div className="ccard-name">{c.name || "（氏名未入力）"}</div>
          <div className="ccard-job">
            {c.job || "職業未入力"}
            {c.age ? `・${c.age}歳` : ""}
          </div>
        </div>
      </div>
      <div className="badges">
        <StageBadge stage={stageOf(c)} />
        <SegBadge seg={c.seg} />
        <StatusBadge status={c.place?.status} />
      </div>
      <div>
        <TypeChip test={c.test} />
      </div>
      <div className="ccard-foot">
        <div className="score-mini">
          {plan ? (
            <span>
              <span className="lbl">コーチング</span>
              <b>{plan}</b>
            </span>
          ) : (
            <span>
              <span className="lbl">総合スコア</span>
              <b>{score > 0 ? score : "—"}</b>
              {score > 0 && <span className="max"> / 30</span>}
            </span>
          )}
        </div>
        <div className="date-mini">{c.date || ""}</div>
      </div>
    </button>
  );
}

/* カンバンの1枚（コンパクト＋ステージ変更セレクト） */
function KanbanCard({
  c,
  onOpen,
  onStage,
}: {
  c: Candidate;
  onOpen: () => void;
  onStage: (s: CandidateStage) => void;
}) {
  const t = typeOf(c.test);
  const plan = planLabel(c);
  return (
    <div className="kcard">
      <button className="kcard-main" onClick={onOpen}>
        <Avatar name={c.name} size={30} />
        <div className="kcard-id">
          <div className="kcard-name">{c.name || "（氏名未入力）"}</div>
          <div className="kcard-sub">
            {plan || c.job || "—"}
            {t && <span className="kcard-type">{t.code}</span>}
          </div>
        </div>
      </button>
      <select
        className="kcard-stage"
        value={stageOf(c)}
        onChange={(e) => onStage(e.target.value as CandidateStage)}
        title="ステージを変更"
      >
        {ALL_STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.key}
          </option>
        ))}
      </select>
    </div>
  );
}

type SegFilter = "all" | Segment;
type StageFilter = "all" | CandidateStage;

export function ListView() {
  const { candidates, addCandidate, navigate, saving, setField } = useApp();
  const [mode, setMode] = useState<"kanban" | "list">("kanban");
  const [seg, setSeg] = useState<SegFilter>("all");
  const [stageF, setStageF] = useState<StageFilter>("all");
  const [q, setQ] = useState("");

  const searched = useMemo(() => {
    const needle = q.trim();
    return candidates.filter((c) => {
      if (seg !== "all" && c.seg !== seg) return false;
      if (!needle) return true;
      return `${c.name} ${c.job} ${c.coach} ${c.loc}`.includes(needle);
    });
  }, [candidates, seg, q]);

  const stageCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of ALL_STAGES) m[s.key] = 0;
    for (const c of searched) m[stageOf(c)]++;
    return m;
  }, [searched]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const coaching = candidates.filter((c) => stageOf(c) === "コーチング中").length;
    const done = candidates.filter((c) => stageOf(c) === "完了").length;
    return { total, coaching, done };
  }, [candidates]);

  const listFiltered = useMemo(
    () => (stageF === "all" ? searched : searched.filter((c) => stageOf(c) === stageF)),
    [searched, stageF]
  );

  const setStage = (id: string, s: CandidateStage) => setField(id, ["stage"], s);

  return (
    <>
      <AppBar
        right={
          <>
            <div className="searchbox">
              <Icon name="search" size={16} />
              <input placeholder="氏名・職業で検索" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Saver saving={saving} />
            <button className="btn btn-primary" onClick={addCandidate}>
              <Icon name="plus" size={16} />
              新規追加
            </button>
          </>
        }
      />

      <main className="page" data-screen-label="候補者一覧">
        <div className="home-head">
          <div>
            <div className="eyebrow">Candidates</div>
            <h1>候補者一覧</h1>
            <p>無料体験からコーチング完了までのファネルで管理します。</p>
          </div>
          <div className="seg-switch">
            <button className={mode === "kanban" ? "on" : ""} onClick={() => setMode("kanban")}>
              <Icon name="grid" size={14} />
              カンバン
            </button>
            <button className={mode === "list" ? "on" : ""} onClick={() => setMode("list")}>
              <Icon name="list" size={14} />
              リスト
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="k">総候補者数</div>
            <div className="v">
              {stats.total}
              <small>名</small>
            </div>
          </div>
          <div className="stat">
            <div className="k">コーチング中</div>
            <div className="v">
              {stats.coaching}
              <small>名</small>
            </div>
          </div>
          <div className="stat is-accent">
            <div className="k">完了</div>
            <div className="v">
              {stats.done}
              <small>名</small>
            </div>
          </div>
        </div>

        {/* セグメント絞り込み（両モード共通） */}
        <div className="filters">
          <div className="filter-group">
            {(
              [
                ["all", "すべて"],
                ["newgrad", "新卒"],
                ["career", "中途"],
              ] as [SegFilter, string][]
            ).map(([k, lab]) => (
              <button key={k} className={"chip" + (seg === k ? " is-active" : "")} onClick={() => setSeg(k)}>
                {lab}
              </button>
            ))}
          </div>
        </div>

        {mode === "kanban" ? (
          <div className="kanban">
            {STAGES.map((s) => {
              const items = searched.filter((c) => stageOf(c) === s.key);
              return (
                <div key={s.key} className="kcol">
                  <div className={"kcol-head tone-" + s.tone}>
                    <span className="kcol-dot" />
                    {s.key}
                    <span className="kcol-cnt">{items.length}</span>
                  </div>
                  <div className="kcol-body">
                    {items.length === 0 ? (
                      <div className="kcol-empty">—</div>
                    ) : (
                      items.map((c) => (
                        <KanbanCard
                          key={c.id}
                          c={c}
                          onOpen={() => navigate({ name: "profile", id: c.id })}
                          onStage={(v) => setStage(c.id, v)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="filters">
              <div className="filter-group">
                <button
                  className={"chip" + (stageF === "all" ? " is-active" : "")}
                  onClick={() => setStageF("all")}
                >
                  ステージ: すべて
                </button>
                {ALL_STAGES.map((s) => (
                  <button
                    key={s.key}
                    className={"chip" + (stageF === s.key ? " is-active" : "")}
                    onClick={() => setStageF(s.key)}
                  >
                    {s.key}
                    <span className="cnt">{stageCounts[s.key]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid">
              {listFiltered.length === 0 ? (
                <div className="empty-state">
                  <b>該当する候補者がいません</b>
                  条件を変更するか、「新規追加」で候補者を登録してください。
                </div>
              ) : (
                listFiltered.map((c) => (
                  <CandidateCard key={c.id} c={c} onOpen={() => navigate({ name: "profile", id: c.id })} />
                ))
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

/* タブ：マイページ — コーチ個別メッセージ / セクション表示制御 / この候補者への個別お知らせ */
import type { TabProps } from "../ProfileView";
import type { MypageSection, MypageSectionKey } from "../../../lib/types";
import { useApp } from "../../../store/AppStore";
import { blankAnnouncement } from "../../../lib/announcement";
import { TextArea, Switch } from "../../ui/primitives";
import { Icon } from "../../ui/Icon";
import { AnnouncementEditor } from "../../news/AnnouncementEditor";

const SECTION_LABELS: Record<MypageSectionKey, string> = {
  message: "コーチからのメッセージ",
  next: "次回の面談",
  quick: "クイックアクション",
  coaching: "コーチングの進捗",
  news: "お知らせ",
  bookcta: "別日程の予約案内",
};
const DEFAULT_ORDER: MypageSectionKey[] = ["message", "next", "quick", "coaching", "news", "bookcta"];

/** 保存済みレイアウト＋既定を統合して、表示順の配列を返す（未知キーは除外・欠けは末尾に補完） */
function resolveSections(sections?: MypageSection[]): MypageSection[] {
  const stored = (sections ?? []).filter((s) => DEFAULT_ORDER.includes(s.key));
  const onMap = new Map(stored.map((s) => [s.key, s.on]));
  const order: MypageSectionKey[] = [
    ...stored.map((s) => s.key),
    ...DEFAULT_ORDER.filter((k) => !stored.some((s) => s.key === k)),
  ];
  return order.map((key) => ({ key, on: onMap.has(key) ? !!onMap.get(key) : true }));
}

export function TabMypage({ c, set }: TabProps) {
  const { announcements, saveAnnouncement, removeAnnouncement } = useApp();
  const sections = resolveSections(c.mypageLayout?.sections);
  const mine = announcements.filter((n) => n.candidateId === c.id);

  const writeSections = (next: MypageSection[]) => set(["mypageLayout", "sections"], next);
  const toggle = (key: MypageSectionKey, on: boolean) =>
    writeSections(sections.map((s) => (s.key === key ? { ...s, on } : s)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    writeSections(next);
  };

  return (
    <div className="tabpane">
      {/* 個別メッセージ */}
      <div className="card" style={{ maxWidth: 880 }}>
        <div className="card-head">
          <span className="sec"><Icon name="edit" size={15} /></span>
          <h3>コーチからのメッセージ</h3>
          <span className="hint">マイページ上部に表示されます（空欄なら非表示）</span>
        </div>
        <TextArea
          value={c.mypageMessage ?? ""}
          rows={4}
          onChange={(v) => set(["mypageMessage"], v)}
          placeholder="例：先日の面談おつかれさまでした。次回までに職務経歴書のドラフトを一緒に仕上げましょう。"
        />
      </div>

      {/* セクション表示・並び順 */}
      <div className="card" style={{ maxWidth: 880, marginTop: 16 }}>
        <div className="card-head">
          <span className="sec"><Icon name="list" size={15} /></span>
          <h3>表示セクションと並び順</h3>
          <span className="hint">この候補者のマイページに出すブロックを選べます</span>
        </div>
        <div className="mp-sections">
          {sections.map((s, i) => (
            <div className={"mp-section-row" + (s.on ? "" : " off")} key={s.key}>
              <div className="mp-reorder">
                <button className="btn-icon btn-ghost btn-sm" disabled={i === 0} onClick={() => move(i, -1)} title="上へ">
                  <Icon name="chevUp" size={14} />
                </button>
                <button
                  className="btn-icon btn-ghost btn-sm"
                  disabled={i === sections.length - 1}
                  onClick={() => move(i, 1)}
                  title="下へ"
                >
                  <Icon name="chevDown" size={14} />
                </button>
              </div>
              <span className="mp-section-name">{SECTION_LABELS[s.key]}</span>
              <Switch on={s.on} onChange={(v) => toggle(s.key, v)} label={s.on ? "表示" : "非表示"} />
            </div>
          ))}
        </div>
        <div className="note-box" style={{ marginTop: 12 }}>
          あいさつ（氏名・タイプ）は常に表示されます。未設定の場合は既定の順序で全て表示されます。
        </div>
      </div>

      {/* この候補者への個別お知らせ */}
      <div className="card" style={{ maxWidth: 880, marginTop: 16 }}>
        <div className="card-head">
          <span className="sec"><Icon name="spark" size={15} /></span>
          <h3>この候補者への個別お知らせ</h3>
          <span className="hint">この候補者だけに表示されます</span>
        </div>
        <div className="note-box" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          全員向けのお知らせは上部メニューの「お知らせ」から管理します。
          <button
            className="btn btn-sm"
            style={{ marginLeft: "auto" }}
            onClick={() => saveAnnouncement(blankAnnouncement({ candidateId: c.id }))}
          >
            <Icon name="plus" size={14} />
            個別お知らせを追加
          </button>
        </div>
      </div>

      {mine.map((n) => (
        <AnnouncementEditor
          key={n.id}
          value={n}
          lockCandidate
          onChange={saveAnnouncement}
          onDelete={() => removeAnnouncement(n.id)}
        />
      ))}
    </div>
  );
}

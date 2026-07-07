/* お知らせ管理画面（全員共通＋個別のCRUD） */
import { useApp } from "../../store/AppStore";
import { AppBar } from "../AppBar";
import { Icon } from "../ui/Icon";
import { Saver } from "../ui/primitives";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { blankAnnouncement } from "../../lib/announcement";

export function NewsView() {
  const { announcements, candidates, saving, saveAnnouncement, removeAnnouncement } = useApp();

  // 表示順：ピン留め→公開日の新しい順
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.publishedAt || "").localeCompare(a.publishedAt || "");
  });
  const broadcast = sorted.filter((n) => !n.candidateId);
  const targeted = sorted.filter((n) => n.candidateId);
  const nameOf = (id: string) => candidates.find((c) => c.id === id)?.name || "（氏名未入力）";

  return (
    <>
      <AppBar
        right={
          <>
            <Saver saving={saving} />
            <button className="btn btn-primary" onClick={() => saveAnnouncement(blankAnnouncement())}>
              <Icon name="plus" size={16} />
              お知らせを追加
            </button>
          </>
        }
      />

      <main className="page" data-screen-label="お知らせ管理">
        <div className="home-head">
          <div>
            <div className="eyebrow">Announcements</div>
            <h1>お知らせ管理</h1>
            <p>候補者マイページに表示するお知らせを管理します。「全員に配信」と候補者ごとの「個別配信」を作成できます。</p>
          </div>
        </div>

        {announcements.length === 0 && (
          <div className="empty-state">
            <b>まだお知らせがありません</b>
            右上の「お知らせを追加」から作成してください。
          </div>
        )}

        {broadcast.length > 0 && (
          <>
            <div className="card-head" style={{ maxWidth: 880, margin: "8px auto 0" }}>
              <span className="sec"><Icon name="users" size={15} /></span>
              <h3>全員へのお知らせ</h3>
              <span className="hint">{broadcast.length}件</span>
            </div>
            {broadcast.map((n) => (
              <AnnouncementEditor
                key={n.id}
                value={n}
                candidates={candidates}
                onChange={saveAnnouncement}
                onDelete={() => removeAnnouncement(n.id)}
              />
            ))}
          </>
        )}

        {targeted.length > 0 && (
          <>
            <div className="card-head" style={{ maxWidth: 880, margin: "24px auto 0" }}>
              <span className="sec"><Icon name="user" size={15} /></span>
              <h3>個別のお知らせ</h3>
              <span className="hint">{targeted.length}件</span>
            </div>
            {targeted.map((n) => (
              <div key={n.id}>
                <div style={{ maxWidth: 880, margin: "10px auto -6px", fontSize: 12, color: "var(--muted, #888)" }}>
                  宛先：<b>{nameOf(n.candidateId!)}</b>
                </div>
                <AnnouncementEditor
                  value={n}
                  candidates={candidates}
                  onChange={saveAnnouncement}
                  onDelete={() => removeAnnouncement(n.id)}
                />
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}

/* お知らせ1件のエディタ（お知らせ管理画面／マイページタブで共用） */
import type { Announcement, AnnouncementKind, Candidate } from "../../lib/types";
import { KIND_LABELS, KINDS } from "../../lib/announcement";
import { Field, TextInput, TextArea, Select, Switch } from "../ui/primitives";
import { Icon } from "../ui/Icon";

export function AnnouncementEditor({
  value,
  onChange,
  onDelete,
  candidates,
  lockCandidate,
}: {
  value: Announcement;
  onChange: (next: Announcement) => void;
  onDelete: () => void;
  /** 配信先セレクトを出す場合に渡す（お知らせ管理画面） */
  candidates?: Candidate[];
  /** true の場合は配信先を固定（候補者プロファイル内） */
  lockCandidate?: boolean;
}) {
  const set = <K extends keyof Announcement>(key: K, v: Announcement[K]) =>
    onChange({ ...value, [key]: v });

  const dateVal = value.publishedAt ? value.publishedAt.slice(0, 10) : "";

  return (
    <div className="card" style={{ maxWidth: 880, marginTop: 16 }}>
      <div className="card-head">
        <span className={"sec" + (value.active ? "" : " off")}>
          <Icon name="spark" size={15} />
        </span>
        <h3>{value.title || "（無題のお知らせ）"}</h3>
        <span className="hint">{KIND_LABELS[value.kind]}{value.candidateId ? "・個別" : "・全員"}</span>
      </div>

      <div className="form-grid">
        <Field label="種別">
          <Select
            value={value.kind}
            onChange={(v) => set("kind", v as AnnouncementKind)}
            options={KINDS.map((k) => ({ value: k, label: KIND_LABELS[k] }))}
          />
        </Field>
        <Field label="タグ（バッジ表示）">
          <TextInput value={value.tag} onChange={(v) => set("tag", v)} placeholder="お知らせ / 重要 など" />
        </Field>

        {candidates && !lockCandidate && (
          <Field label="配信先">
            <Select
              value={value.candidateId ?? ""}
              onChange={(v) => set("candidateId", v || null)}
              options={[
                { value: "", label: "全員に配信" },
                ...candidates.map((c) => ({ value: c.id, label: c.name || "（氏名未入力）" })),
              ]}
            />
          </Field>
        )}
        <Field label="公開日">
          <TextInput
            type="date"
            value={dateVal}
            onChange={(v) => set("publishedAt", v ? new Date(v + "T09:00:00+09:00").toISOString() : new Date().toISOString())}
          />
        </Field>

        <Field label="タイトル" full>
          <TextInput value={value.title} onChange={(v) => set("title", v)} placeholder="お知らせのタイトル" />
        </Field>
        <Field label="リード（一覧に表示する短い説明）" full>
          <TextInput value={value.lead} onChange={(v) => set("lead", v)} placeholder="一覧カードに出る1〜2行" />
        </Field>
        <Field label="本文（詳細画面に表示）" full>
          <TextArea value={value.body} rows={4} onChange={(v) => set("body", v)} placeholder="詳細画面で表示される本文…" />
        </Field>
      </div>
      {/*
        「ボタン文言（CTA）」の入力欄は撤去した。リンク先を保存する列が無く、
        マイページ側で押しても遷移できないダミーになっていたため（R-002）。
        遷移先を持たせるなら announcements に cta_url を足してから復活させる。
      */}

      <div className="note-box" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <Switch on={value.active} onChange={(v) => set("active", v)} label={value.active ? "公開中" : "非公開"} />
        <Switch on={value.pinned} onChange={(v) => set("pinned", v)} label="上部に固定（ピン留め）" />
        <button className="linklike" style={{ marginLeft: "auto" }} onClick={onDelete}>
          <Icon name="trash" size={13} />
          削除
        </button>
      </div>
    </div>
  );
}

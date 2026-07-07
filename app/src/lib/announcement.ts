/* お知らせ/ニュースの生成・表示ヘルパ */
import type { Announcement, AnnouncementKind } from "./types";

export const KIND_LABELS: Record<AnnouncementKind, string> = {
  news: "お知らせ",
  service: "サービス",
  campaign: "キャンペーン",
};

export const KINDS: AnnouncementKind[] = ["news", "service", "campaign"];

export function blankAnnouncement(partial: Partial<Announcement> = {}): Announcement {
  return {
    id: crypto.randomUUID(),
    candidateId: null,
    kind: "news",
    tag: "お知らせ",
    tone: "",
    title: "",
    lead: "",
    body: "",
    cta: "",
    pinned: false,
    active: true,
    publishedAt: new Date().toISOString(),
    ...partial,
  };
}

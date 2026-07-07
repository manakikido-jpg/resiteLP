/* =========================================================
   データリポジトリ
   - env 未設定: localStorage（プロトタイプ同等・即動作）
   - env 設定済: Supabase（3テーブル CRUD）
   ストアは本インターフェース越しに永続化する（Realtime は第二段階）。
   ========================================================= */
import { supabase } from "../lib/supabase";
import type { Announcement, Appointment, Candidate, FormConfig } from "../lib/types";
import { DEFAULT_FORM_FIELDS, DEFAULT_SLOT_CONFIG } from "../data/formDefaults";
import { SEED_APPOINTMENTS, SEED_CANDIDATES } from "../data/seed";

export interface LoadedData {
  candidates: Candidate[];
  appts: Appointment[];
  formConfig: FormConfig;
  announcements: Announcement[];
}

export interface DataRepository {
  readonly mode: "localStorage" | "supabase";
  loadAll(): Promise<LoadedData>;
  saveCandidate(c: Candidate): Promise<void>;
  deleteCandidate(id: string): Promise<void>;
  saveAppt(a: Appointment): Promise<void>;
  deleteAppt(id: string): Promise<void>;
  saveFormConfig(cfg: FormConfig): Promise<void>;
  saveAnnouncement(n: Announcement): Promise<void>;
  deleteAnnouncement(id: string): Promise<void>;
}

/* ---------------- localStorage 実装 ---------------- */

const KEY_CANDIDATES = "kanousei_candidates_v1";
const KEY_SCHEDULE = "kanousei_schedule_v1";
// v2: 予約ページ連動のため既定フォーム項目を刷新（旧 v1 キャッシュは破棄）
const KEY_FORM = "kanousei_form_v2";
const KEY_NEWS = "kanousei_news_v1";

function readArray<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const v = JSON.parse(raw);
      if (Array.isArray(v)) return v as T[];
    }
  } catch {
    /* ignore */
  }
  return null;
}
function readObject<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const v = JSON.parse(raw);
      if (v && typeof v === "object") return v as T;
    }
  } catch {
    /* ignore */
  }
  return null;
}
function write(key: string, val: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

class LocalStorageRepository implements DataRepository {
  readonly mode = "localStorage" as const;

  async loadAll(): Promise<LoadedData> {
    const candidates = readArray<Candidate>(KEY_CANDIDATES) ?? SEED_CANDIDATES;
    const appts = readArray<Appointment>(KEY_SCHEDULE) ?? SEED_APPOINTMENTS;
    const formConfig =
      readObject<FormConfig>(KEY_FORM) ?? { fields: DEFAULT_FORM_FIELDS, slots: DEFAULT_SLOT_CONFIG };
    const announcements = readArray<Announcement>(KEY_NEWS) ?? [];
    // 初回はシードを書き込んで「共有ストレージ」を初期化
    if (!readArray<Candidate>(KEY_CANDIDATES)) write(KEY_CANDIDATES, candidates);
    if (!readArray<Appointment>(KEY_SCHEDULE)) write(KEY_SCHEDULE, appts);
    if (!readObject<FormConfig>(KEY_FORM)) write(KEY_FORM, formConfig);
    return { candidates, appts, formConfig, announcements };
  }

  async saveCandidate(c: Candidate): Promise<void> {
    const list = readArray<Candidate>(KEY_CANDIDATES) ?? [];
    const i = list.findIndex((x) => x.id === c.id);
    const next = i >= 0 ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list];
    write(KEY_CANDIDATES, next);
  }
  async deleteCandidate(id: string): Promise<void> {
    const list = readArray<Candidate>(KEY_CANDIDATES) ?? [];
    write(KEY_CANDIDATES, list.filter((x) => x.id !== id));
    const appts = readArray<Appointment>(KEY_SCHEDULE) ?? [];
    write(KEY_SCHEDULE, appts.filter((a) => a.candidateId !== id));
  }
  async saveAppt(a: Appointment): Promise<void> {
    const list = readArray<Appointment>(KEY_SCHEDULE) ?? [];
    const i = list.findIndex((x) => x.id === a.id);
    const next = i >= 0 ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
    write(KEY_SCHEDULE, next);
  }
  async deleteAppt(id: string): Promise<void> {
    const list = readArray<Appointment>(KEY_SCHEDULE) ?? [];
    write(KEY_SCHEDULE, list.filter((x) => x.id !== id));
  }
  async saveFormConfig(cfg: FormConfig): Promise<void> {
    write(KEY_FORM, cfg);
  }
  async saveAnnouncement(n: Announcement): Promise<void> {
    const list = readArray<Announcement>(KEY_NEWS) ?? [];
    const i = list.findIndex((x) => x.id === n.id);
    const next = i >= 0 ? list.map((x) => (x.id === n.id ? n : x)) : [n, ...list];
    write(KEY_NEWS, next);
  }
  async deleteAnnouncement(id: string): Promise<void> {
    const list = readArray<Announcement>(KEY_NEWS) ?? [];
    write(KEY_NEWS, list.filter((x) => x.id !== id));
  }
}

/* ---------------- Supabase 実装 ---------------- */

interface CandidateRow {
  id: string;
  reservation_token: string | null;
  name: string;
  phone: string;
  exp: string;
  age: string;
  job: string;
  loc: string;
  seg: string;
  stage: string;
  src: string;
  date: string | null;
  coach: string;
  i1: Candidate["i1"];
  i2: Candidate["i2"];
  test: Candidate["test"];
  asmt: Candidate["asmt"];
  place: Candidate["place"];
  coaching: Candidate["coaching"] | Record<string, never>;
  mypage_message: string | null;
  mypage_layout: Candidate["mypageLayout"] | null;
  created_at: string;
}

function rowToCandidate(r: CandidateRow): Candidate {
  return {
    id: r.id,
    reservationToken: r.reservation_token ?? undefined,
    name: r.name ?? "",
    phone: r.phone ?? "",
    exp: r.exp ?? "なし",
    age: r.age ?? "",
    job: r.job ?? "",
    loc: r.loc ?? "",
    seg: (r.seg as Candidate["seg"]) ?? "career",
    stage: (r.stage as Candidate["stage"]) ?? "無料体験予約",
    src: r.src ?? "",
    date: r.date ?? "",
    coach: r.coach ?? "",
    i1: r.i1 ?? {},
    i2: r.i2 ?? {},
    test: r.test ?? {},
    asmt: r.asmt,
    place: r.place,
    coaching: r.coaching && Object.keys(r.coaching).length > 0 ? (r.coaching as Candidate["coaching"]) : undefined,
    mypageMessage: r.mypage_message ?? "",
    mypageLayout: r.mypage_layout ?? {},
    at: r.created_at,
  };
}
function candidateToRow(c: Candidate): CandidateRow {
  return {
    id: c.id,
    reservation_token: c.reservationToken ?? null,
    name: c.name,
    phone: c.phone,
    exp: c.exp,
    age: c.age,
    job: c.job,
    loc: c.loc,
    seg: c.seg,
    stage: c.stage ?? "無料体験予約",
    src: c.src,
    date: c.date || null,
    coach: c.coach,
    i1: c.i1,
    i2: c.i2,
    test: c.test,
    asmt: c.asmt,
    place: c.place,
    coaching: c.coaching ?? {},
    mypage_message: c.mypageMessage ?? "",
    mypage_layout: c.mypageLayout ?? {},
    created_at: c.at,
  };
}

interface AnnouncementRow {
  id: string;
  candidate_id: string | null;
  kind: string;
  tag: string;
  tone: string;
  title: string;
  lead: string;
  body: string;
  cta: string;
  pinned: boolean;
  active: boolean;
  published_at: string;
  created_at?: string;
  updated_at?: string;
}
function rowToAnnouncement(r: AnnouncementRow): Announcement {
  return {
    id: r.id,
    candidateId: r.candidate_id,
    kind: (r.kind as Announcement["kind"]) ?? "news",
    tag: r.tag ?? "",
    tone: r.tone ?? "",
    title: r.title ?? "",
    lead: r.lead ?? "",
    body: r.body ?? "",
    cta: r.cta ?? "",
    pinned: !!r.pinned,
    active: r.active ?? true,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function announcementToRow(n: Announcement): AnnouncementRow {
  return {
    id: n.id,
    candidate_id: n.candidateId,
    kind: n.kind,
    tag: n.tag,
    tone: n.tone,
    title: n.title,
    lead: n.lead,
    body: n.body,
    cta: n.cta,
    pinned: n.pinned,
    active: n.active,
    published_at: n.publishedAt,
  };
}

interface ApptRow {
  id: string;
  candidate_id: string | null;
  name: string;
  type: string;
  coach: string;
  at: string;
  status: string;
  source: string;
  memo: string | null;
}
function rowToAppt(r: ApptRow): Appointment {
  return {
    id: r.id,
    candidateId: r.candidate_id,
    name: r.name ?? "",
    type: (r.type as Appointment["type"]) ?? "first",
    coach: r.coach ?? "",
    at: r.at,
    status: (r.status as Appointment["status"]) ?? "予定",
    source: (r.source as Appointment["source"]) ?? "manual",
    memo: r.memo ?? undefined,
  };
}
function apptToRow(a: Appointment): ApptRow {
  return {
    id: a.id,
    candidate_id: a.candidateId,
    name: a.name,
    type: a.type,
    coach: a.coach,
    at: a.at,
    status: a.status,
    source: a.source,
    memo: a.memo ?? null,
  };
}

class SupabaseRepository implements DataRepository {
  readonly mode = "supabase" as const;

  async loadAll(): Promise<LoadedData> {
    const client = supabase!;
    const [cRes, aRes, fRes, nRes] = await Promise.all([
      client.from("candidates").select("*").order("created_at", { ascending: false }),
      client.from("appointments").select("*").order("at", { ascending: true }),
      client.from("form_config").select("*").eq("id", 1).maybeSingle(),
      client.from("announcements").select("*").order("published_at", { ascending: false }),
    ]);
    if (cRes.error) throw cRes.error;
    if (aRes.error) throw aRes.error;
    if (fRes.error) throw fRes.error;
    if (nRes.error) throw nRes.error;

    const candidates = (cRes.data as CandidateRow[]).map(rowToCandidate);
    const appts = (aRes.data as ApptRow[]).map(rowToAppt);
    const formConfig: FormConfig = fRes.data
      ? { fields: fRes.data.fields, slots: fRes.data.slots }
      : { fields: DEFAULT_FORM_FIELDS, slots: DEFAULT_SLOT_CONFIG };
    const announcements = (nRes.data as AnnouncementRow[]).map(rowToAnnouncement);
    return { candidates, appts, formConfig, announcements };
  }

  async saveCandidate(c: Candidate): Promise<void> {
    const { error } = await supabase!.from("candidates").upsert(candidateToRow(c));
    if (error) throw error;
  }
  async deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase!.from("candidates").delete().eq("id", id);
    if (error) throw error;
  }
  async saveAppt(a: Appointment): Promise<void> {
    const { error } = await supabase!.from("appointments").upsert(apptToRow(a));
    if (error) throw error;
  }
  async deleteAppt(id: string): Promise<void> {
    const { error } = await supabase!.from("appointments").delete().eq("id", id);
    if (error) throw error;
  }
  async saveFormConfig(cfg: FormConfig): Promise<void> {
    const { error } = await supabase!
      .from("form_config")
      .upsert({ id: 1, fields: cfg.fields, slots: cfg.slots });
    if (error) throw error;
  }
  async saveAnnouncement(n: Announcement): Promise<void> {
    const { error } = await supabase!.from("announcements").upsert(announcementToRow(n));
    if (error) throw error;
  }
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase!.from("announcements").delete().eq("id", id);
    if (error) throw error;
  }
}

export const repository: DataRepository = supabase
  ? new SupabaseRepository()
  : new LocalStorageRepository();

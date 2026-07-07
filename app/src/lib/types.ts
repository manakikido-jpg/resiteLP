/* =========================================================
   ドメイン型定義（プロトタイプ 02_data_model.md と整合）
   ========================================================= */

export type Segment = "newgrad" | "career";

/** コーチング集客ファネルのステージ */
export type CandidateStage =
  | "無料体験予約"
  | "体験完了"
  | "コーチング中"
  | "完了"
  | "見送り";

export type CandidateStatus =
  | "面談済"
  | "紹介中"
  | "内定"
  | "決定"
  | "保留"
  | "見送り";

export type AxisKey = "axis1" | "axis2" | "axis3" | "axis4";

/** 適性テスト4軸スコア（各 -10..+10）。未実施は空オブジェクト。 */
export type AxisScores = Partial<Record<AxisKey, number>>;

/** コーチ総合所見（各観点 0..5 ＋ 自由記述） */
export interface Assessment {
  marketValue: number;
  selfAwareness: number;
  stressRes: number;
  growthDrive: number;
  communication: number;
  motivation: number;
  notes: string;
}

/** 送客判断 */
export interface Placement {
  industry: string;
  role: string;
  status: CandidateStatus;
  next: string;
  memo: string;
}

/** 面談メモ（キー = 設問ID） */
export type InterviewNotes = Record<string, string>;

export interface Candidate {
  id: string;
  reservationToken?: string;
  name: string;
  phone: string;
  exp: string;
  age: string;
  job: string;
  loc: string;
  seg: Segment;
  /** 集客ファネルのステージ（未設定は「無料体験予約」扱い） */
  stage?: CandidateStage;
  src: string;
  /** 面談日 YYYY-MM-DD */
  date: string;
  coach: string;
  i1: InterviewNotes;
  i2: InterviewNotes;
  test: AxisScores;
  asmt: Assessment;
  place: Placement;
  /** 有料キャリアコーチング（任意・契約者のみ） */
  coaching?: Coaching;
  /** マイページに表示するコーチからの個別メッセージ（空文字=非表示） */
  mypageMessage?: string;
  /** マイページのセクション表示制御（未設定=既定順で全表示） */
  mypageLayout?: MypageLayout;
  /** ISO 8601 作成/更新時刻 */
  at: string;
}

/** マイページのセクションキー（表示順・ON/OFFの単位） */
export type MypageSectionKey =
  | "message"
  | "next"
  | "coaching"
  | "quick"
  | "news"
  | "bookcta";

export interface MypageSection {
  key: MypageSectionKey;
  on: boolean;
}

/** マイページのレイアウト設定（sections の順序が表示順） */
export interface MypageLayout {
  sections?: MypageSection[];
}

export type AnnouncementKind = "news" | "service" | "campaign";

/** お知らせ/ニュース（candidateId=null は全員配信、値ありは個別配信） */
export interface Announcement {
  id: string;
  candidateId: string | null;
  kind: AnnouncementKind;
  tag: string;
  tone: string;
  title: string;
  lead: string;
  body: string;
  cta: string;
  pinned: boolean;
  active: boolean;
  /** 公開日時 ISO 8601 */
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CoachingPlan = "standard" | "full";
export type PaymentStatus = "" | "未入金" | "入金済";

export interface CoachingSession {
  /** セッションテーマ（雛形） */
  theme: string;
  /** セッションゴール（雛形） */
  goal: string;
  /** 実施日 YYYY-MM-DD */
  date: string;
  done: boolean;
  /** 内容サマリー（3〜5行） */
  summary: string;
  /** 次回までのアクション */
  action: string;
  /** コーチ所感・懸念事項 */
  memo: string;
}

export interface Coaching {
  plan: CoachingPlan | null;
  paymentStatus: PaymentStatus;
  /** 開始日 YYYY-MM-DD */
  startDate: string;
  sessions: CoachingSession[];
  /** 完了報告・総括 */
  report: string;
}

export type ApptType = "first" | "second";
export type ApptStatus = "予定" | "完了" | "キャンセル";
export type ApptSource = "form" | "manual";

export interface Appointment {
  id: string;
  /** null = フォーム受付のみでプロファイル未生成 */
  candidateId: string | null;
  name: string;
  type: ApptType;
  coach: string;
  /** ISO 8601（+09:00） */
  at: string;
  status: ApptStatus;
  source: ApptSource;
  memo?: string;
}

export type FieldType = "text" | "tel" | "email" | "select" | "radio" | "textarea";

/** 予定/候補者へ自動マッピングされる連携キー */
export type MapKey =
  | "name"
  | "phone"
  | "exp"
  | "age"
  | "job"
  | "loc"
  | "interviewType";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  mapKey?: MapKey;
  /** 補助テキスト（予約ページのフィールド下に表示） */
  help?: string;
}

export interface WeeklySlot {
  on: boolean;
  start: string;
  end: string;
}

export interface SlotConfig {
  /** 0=日 … 6=土 */
  weekly: Record<number, WeeklySlot>;
  slotMinutes: number;
  capacity: number;
  leadDays: number;
  rangeDays: number;
  /** 休止日 YYYY-MM-DD */
  holidays: string[];
}

export interface FormConfig {
  fields: FormField[];
  slots: SlotConfig;
}

/** Webhook（予約フォーム）受信ペイロード */
export interface WebhookPayload {
  name: string;
  phone: string;
  exp: string;
  age: string;
  job: string;
  loc: string;
  src?: string;
  coach?: string;
  scheduledAt: string;
  interviewType: ApptType;
  /** 職業タイプ診断の連携コード（予約ページに ?code= で引き継がれる。あれば候補者の適性テストへ反映） */
  testCode?: string;
}

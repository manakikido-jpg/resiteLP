/* =========================================================
   候補者マイページ — データ層 / 日付ユーティリティ
   （候補者プロファイル app の設計に整合させた候補者向けデモデータ）
   ========================================================= */

/* ---- 基準日：2026-06-15(月) 09:30 ---- */
const MP_NOW = new Date(2026, 5, 15, 9, 30);

const WD = ["日", "月", "火", "水", "木", "金", "土"];
const pad2 = (n) => String(n).padStart(2, "0");
function ymd(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function fmtTime(d) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function fmtDateJP(d) { return `${d.getMonth() + 1}月${d.getDate()}日`; }
function fmtMonthJP(d) { return `${d.getFullYear()}年${d.getMonth() + 1}月`; }
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / 86400000); }

/* 月グリッド（日曜始まり・6週） */
function monthGrid(d) {
  const first = startOfMonth(d);
  const start = addDays(first, -first.getDay());
  const weeks = [];
  let cur = start;
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) { row.push(cur); cur = addDays(cur, 1); }
    weeks.push(row);
  }
  return weeks;
}

/* ---- 候補者本人 ---- */
const ME = {
  name: "山本 さくら",
  initial: "山",
  seg: "career",          // 中途
  segLabel: "中途",
  job: "経理リーダー",
  age: "33",
  loc: "東京都大田区",
  typeCode: "ELOP",
  typeName: "信頼の伴走者",
  typeEn: "The Counselor",
  coach: "白石 千夏",
  coachInitial: "白",
  joinedAt: "2026-05-20",
};

/* ---- 次回の面談 ---- */
const NEXT = {
  type: "second",
  typeLabel: "第二面談",
  at: new Date(2026, 5, 18, 14, 0),   // 6/18(木) 14:00
  durationMin: 60,
  mode: "online",
  modeLabel: "オンライン",
  place: "Google Meet",
  url: "https://meet.google.com/abc-defg-hij",
  coach: "白石 千夏",
};

/* ---- 第一面談（完了済み・履歴用） ---- */
const HISTORY = [
  { type: "first", typeLabel: "第一面談", at: new Date(2026, 4, 26, 16, 45), status: "完了", coach: "白石 千夏" },
];

/* ---- コーチング進捗 ---- */
const COACHING = {
  plan: "スタンダード",
  planDur: "1ヶ月 / 全4回",
  total: 4,
  done: 2,
  sessions: [
    { no: 1, theme: "自己分析",         date: "5/28", done: true },
    { no: 2, theme: "市場価値診断",     date: "6/4",  done: true },
    { no: 3, theme: "キャリアの方向性", date: "6/18", done: false, next: true },
    { no: 4, theme: "行動計画",         date: "—",    done: false },
  ],
};

/* ---- アナウンス ---- */
const ANNOUNCEMENTS = [
  {
    id: "an_news", kind: "news", tag: "お知らせ", tone: "info",
    date: "6/12", title: "夏季休業のお知らせ", pinned: true,
    lead: "8/13(木)〜8/16(日)は面談・サポートをお休みします。",
    body: "誠に勝手ながら、8月13日(木)〜16日(日)を夏季休業とさせていただきます。\n\n期間中にいただいたお問い合わせは、8月17日(月)以降に順次ご返信いたします。面談のご予約は通常どおり受け付けておりますので、ご希望の方はマイページよりお手続きください。\n\nご不便をおかけしますが、何卒よろしくお願いいたします。",
  },
  {
    id: "an_value", kind: "service", tag: "市場価値診断", tone: "cyan",
    date: "6/10", title: "あなたの市場価値、3分で診断してみませんか？",
    lead: "かんたんな質問に答えるだけで、いまの強みTOP3が見えてきます。",
    body: "面談前の準備としても好評の「市場価値診断」。3分ほどのかんたんな質問に答えるだけで、あなたの強みや市場でのポジションを可視化します。\n\n診断結果は次回の面談でも活用できます。ぜひ受けてみてください。",
    cta: "診断をはじめる",
  },
  {
    id: "an_camp", kind: "campaign", tag: "キャンペーン", tone: "warn",
    date: "6/3", title: "友だち紹介で Amazonギフト 3,000円分プレゼント",
    lead: "お知り合いをご紹介いただくと、おふたりにギフトを進呈します。",
    body: "可能性ラボを友だちにご紹介いただき、ご紹介された方が初回面談を完了すると、紹介してくださった方・された方の双方に Amazonギフト券 3,000円分をプレゼントいたします。\n\n紹介用リンクはマイページのメニューから発行できます。この機会にぜひご活用ください。",
    cta: "紹介リンクを発行",
  },
];

/* =========================================================
   予約・空き枠ロジック
   ========================================================= */
const SLOT_CONFIG = {
  // 0=日 … 6=土
  weekly: {
    0: { on: false, start: "10:00", end: "18:00" },
    1: { on: true,  start: "10:00", end: "19:00" },
    2: { on: true,  start: "10:00", end: "19:00" },
    3: { on: true,  start: "10:00", end: "19:00" },
    4: { on: true,  start: "10:00", end: "19:00" },
    5: { on: true,  start: "10:00", end: "20:00" },
    6: { on: true,  start: "11:00", end: "17:00" },
  },
  slotMinutes: 60,
  leadDays: 1,
  rangeDays: 30,
  holidays: ["2026-06-22", "2026-07-06"],
};

const MIN_DAY = addDays(startOfDay(MP_NOW), SLOT_CONFIG.leadDays);
const MAX_DAY = addDays(startOfDay(MP_NOW), SLOT_CONFIG.rangeDays);

/* 決定的な擬似乱数（同じ日付・時刻なら常に同じ結果） */
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }

/* その日の枠（時刻 + 空き状況） */
function slotsForDay(date) {
  const wd = date.getDay();
  const w = SLOT_CONFIG.weekly[wd];
  if (!w || !w.on) return [];
  const key = ymd(date);
  if (SLOT_CONFIG.holidays.includes(key)) return [];
  const d0 = startOfDay(date);
  if (d0 < MIN_DAY || d0 > MAX_DAY) return [];
  const [sh, sm] = w.start.split(":").map(Number);
  const [eh, em] = w.end.split(":").map(Number);
  const startMin = sh * 60 + sm, endMin = eh * 60 + em;
  const out = [];
  for (let m = startMin; m + SLOT_CONFIG.slotMinutes <= endMin; m += SLOT_CONFIG.slotMinutes) {
    const time = `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
    const taken = hashStr(key + time) % 10 < 4;   // 約4割は予約済み
    out.push({ time, taken });
  }
  return out;
}
function dayHasOpen(date) { return slotsForDay(date).some((s) => !s.taken); }

Object.assign(window, {
  MP_NOW, WD, pad2, ymd, fmtTime, fmtDateJP, fmtMonthJP,
  startOfDay, addDays, sameDay, startOfMonth, monthGrid, daysBetween,
  ME, NEXT, HISTORY, COACHING, ANNOUNCEMENTS,
  SLOT_CONFIG, MIN_DAY, MAX_DAY, slotsForDay, dayHasOpen,
});

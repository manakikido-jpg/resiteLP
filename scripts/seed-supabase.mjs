/* Supabase へデモデータ投入（Management API 経由）。
   使い方: SBP=<access_token> REF=<project_ref> node scripts/seed-supabase.mjs */
const REF = process.env.REF;
const TOKEN = process.env.SBP;
const API = `https://api.supabase.com/v1/projects/${REF}/database/query`;

async function sql(query) {
  const r = await fetch(API, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`SQL ${r.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}
const J = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const S = (v) => `'${String(v).replace(/'/g, "''")}'`;

const stdSessions = (doneN) =>
  [
    ["自己分析", "価値観・強みを言語化する"],
    ["市場価値診断", "市場における自分の立ち位置を把握する"],
    ["方向性決定", "キャリアの方向性を1本に絞る"],
    ["行動計画", "来月から動けるアクションプランを作る"],
  ].map(([theme, goal], i) => ({
    theme, goal,
    date: i < doneN ? "2026-06-" + String(3 + i * 3).padStart(2, "0") : "",
    done: i < doneN,
    summary: i < doneN ? "セッション記録（デモ）" : "",
    action: i < doneN ? "次回までの宿題（デモ）" : "",
    memo: "",
  }));

const SLOTS = {
  weekly: {
    0: { on: false, start: "10:00", end: "18:00" },
    1: { on: true, start: "10:00", end: "19:00" },
    2: { on: true, start: "10:00", end: "19:00" },
    3: { on: true, start: "10:00", end: "19:00" },
    4: { on: true, start: "10:00", end: "19:00" },
    5: { on: true, start: "10:00", end: "20:00" },
    6: { on: true, start: "11:00", end: "17:00" },
  },
  slotMinutes: 60, capacity: 2, leadDays: 1, rangeDays: 30, holidays: [],
};
const FIELDS = [
  { id: "f_name", label: "お名前", type: "text", required: true, placeholder: "例：山田 花子", mapKey: "name" },
  { id: "f_phone", label: "電話番号", type: "tel", required: true, placeholder: "例：090-0000-0000", mapKey: "phone", help: "担当コーチからのご連絡に使います。営業電話には使いません。" },
  { id: "f_exp", label: "転職経験", type: "radio", required: false, options: ["なし", "1回", "2回", "3回以上"], mapKey: "exp" },
  { id: "f_age", label: "年齢", type: "radio", required: false, options: ["〜24", "25–29", "30–34", "35–39", "40–44", "45〜"], mapKey: "age" },
  { id: "f_job", label: "現在の職業", type: "text", required: false, placeholder: "例：法人営業、看護師など", mapKey: "job" },
  { id: "f_loc", label: "お住まい", type: "text", required: false, placeholder: "例：東京都", mapKey: "loc" },
];

const CANDS = [
  {
    name: "田中 陽斗", phone: "090-1234-5678", exp: "なし", age: "23", job: "大学4年（経済学部）",
    loc: "東京都世田谷区", seg: "newgrad", stage: "コーチング中", src: "Instagram", date: "2026-05-21", coach: "森田 涼介",
    test: { axis1: 6, axis2: 5, axis3: 4, axis4: 7 },
    asmt: { marketValue: 3, selfAwareness: 4, stressRes: 4, growthDrive: 5, communication: 5, motivation: 4, notes: "強み：エネルギーと巻き込み力。" },
    place: { industry: "人材 / 通信", role: "法人営業", status: "面談済", next: "", memo: "" },
    coaching: { plan: "standard", paymentStatus: "入金済", startDate: "2026-06-01", sessions: stdSessions(2), report: "" },
    appt: { type: "second", at: "2026-06-26T14:00:00+09:00" },
  },
  {
    name: "山本 さくら", phone: "090-4567-8901", exp: "なし", age: "22", job: "短大2年（保育系）",
    loc: "千葉県船橋市", seg: "newgrad", stage: "体験完了", src: "Facebook", date: "2026-05-26", coach: "白石 千夏",
    test: { axis1: -6, axis2: -3, axis3: -4, axis4: 5 },
    asmt: { marketValue: 2, selfAwareness: 3, stressRes: 3, growthDrive: 3, communication: 4, motivation: 3, notes: "" },
    place: { industry: "", role: "", status: "面談済", next: "", memo: "" },
    coaching: { plan: null, paymentStatus: "", startDate: "", sessions: [], report: "" },
    appt: null,
  },
  {
    name: "小林 直樹", phone: "090-6789-0123", exp: "1回", age: "31", job: "経理（メーカー）",
    loc: "埼玉県さいたま市", seg: "career", stage: "無料体験予約", src: "Instagram", date: "2026-06-28", coach: "白石 千夏",
    test: {}, asmt: {}, place: { status: "面談済" },
    coaching: { plan: null, paymentStatus: "", startDate: "", sessions: [], report: "" },
    appt: { type: "first", at: "2026-06-28T10:00:00+09:00" },
  },
];

(async () => {
  // form_config
  await sql(`insert into form_config (id, fields, slots) values (1, ${J(FIELDS)}, ${J(SLOTS)})
    on conflict (id) do update set fields=excluded.fields, slots=excluded.slots;`);
  console.log("✓ form_config");

  const tokens = [];
  for (const c of CANDS) {
    const rows = await sql(`insert into candidates
      (name, phone, exp, age, job, loc, seg, stage, src, date, coach, test, asmt, place, coaching)
      values (${S(c.name)}, ${S(c.phone)}, ${S(c.exp)}, ${S(c.age)}, ${S(c.job)}, ${S(c.loc)},
        ${S(c.seg)}, ${S(c.stage)}, ${S(c.src)}, ${S(c.date)}, ${S(c.coach)},
        ${J(c.test)}, ${J(c.asmt)}, ${J(c.place)}, ${J(c.coaching)})
      returning id, reservation_token, name;`);
    const { id, reservation_token, name } = rows[0];
    tokens.push({ name, reservation_token });
    if (c.appt) {
      await sql(`insert into appointments (candidate_id, name, type, coach, at, status, source)
        values (${S(id)}, ${S(c.name)}, ${S(c.appt.type)}, ${S(c.coach)}, ${S(c.appt.at)}, '予定', 'form');`);
    }
    console.log("✓ candidate:", name);
  }
  console.log("\n=== マイページ用 token ===");
  for (const t of tokens) console.log(`${t.name}: ${t.reservation_token}`);
})().catch((e) => { console.error(e); process.exit(1); });

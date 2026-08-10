/* =========================================================
   候補者マイページ — Supabase 連携（token で本人データ取得・予約）
   ?token= の reservation_token で本人を特定し、RPC（mypage_get / mypage_book）経由で
   本人の次回面談・コーチング進捗を取得、予約を作成する。anon キーは公開鍵。
   ========================================================= */
const SB_URL = "https://rygredsfgbvjtllnlrto.supabase.co";
const SB_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3JlZHNmZ2J2anRsbG5scnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNDgxNjAsImV4cCI6MjA5NzgyNDE2MH0.idKnX5YfcyH8WKq3An32_UhxBKnpQH72YXd_PNiLz5w";

function getMpToken() {
  try {
    return (new URL(window.location.href).searchParams.get("token") || "").trim();
  } catch (e) {
    return "";
  }
}

async function sbRpc(name, body) {
  const r = await fetch(SB_URL + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("rpc " + name + " " + r.status);
  return r.json();
}
async function sbFormConfig() {
  const r = await fetch(SB_URL + "/rest/v1/form_config?id=eq.1&select=fields,slots", {
    headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON },
  });
  const a = await r.json();
  return Array.isArray(a) && a[0] ? a[0] : null;
}

/* 4軸スコア → タイプコード・名称（プロファイル/診断と同一） */
const POS = ["S", "T", "O", "P"];
const NEG = ["E", "L", "I", "C"];
const TYPE_NAMES = {
  STOP: "未来の指揮官", STOC: "堅実な参謀", STIP: "発想の伝道師", STIC: "慎重な編集者",
  SLOP: "前向きな戦略家", SLOC: "静かな分析家", SLIP: "独立の革新者", SLIC: "探究の哲学者",
  ETOP: "共感の推進者", ETOC: "チームの調律師", ETIP: "人を灯す案内人", ETIC: "物語の紡ぎ手",
  ELOP: "信頼の伴走者", ELOC: "寄り添う実務家", ELIP: "静かな共鳴者", ELIC: "手仕事の癒し手",
};
function typeOf(test) {
  if (!test) return null;
  const ks = ["axis1", "axis2", "axis3", "axis4"];
  if (!ks.some((k) => typeof test[k] === "number")) return null;
  const code = ks.map((k, i) => ((test[k] ?? 0) >= 0 ? POS[i] : NEG[i])).join("");
  return { code, name: TYPE_NAMES[code] || "" };
}

const PLAN = {
  standard: { label: "スタンダード", dur: "1ヶ月 / 全4回", total: 4 },
  full: { label: "フル", dur: "2ヶ月 / 全8回", total: 8 },
};

/* Date → "YYYY-MM-DDTHH:mm:00+09:00" */
function toIsoJST(d) {
  const p = window.pad2;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00+09:00`;
}

/* 枠ごとの予約件数を取得（個人情報は含まない。migration 0005 の slot_counts）。
   未適用の環境では {} を返し、従来どおり全枠オープン表示にフォールバックする。 */
async function sbSlotCounts(from, to) {
  try {
    const counts = await sbRpc("slot_counts", { p_from: window.ymd(from), p_to: window.ymd(to) });
    return counts && typeof counts === "object" ? counts : {};
  } catch (e) {
    console.warn("slot_counts unavailable (migration 0005 未適用?)", e);
    return {};
  }
}

/* form_config.slots 駆動の空き枠。
   以前はここが常に taken:false を返し、コメントにも「capacity判定はサーバ側」と
   書いてあったが、実際にはサーバ側にも定員チェックが無く二重予約が通っていた（R-007）。
   件数は slot_counts から取り、最終的な可否は mypage_book が強制する。 */
function buildSlotsForDay(config, now, counts) {
  const minDay = window.addDays(window.startOfDay(now), config.leadDays);
  const maxDay = window.addDays(window.startOfDay(now), config.rangeDays);
  const holidays = config.holidays || [];
  const capacity = Math.max(1, config.capacity || 1);
  return function (date) {
    const w = config.weekly[date.getDay()];
    if (!w || !w.on) return [];
    if (holidays.includes(window.ymd(date))) return [];
    const d0 = window.startOfDay(date);
    if (d0 < minDay || d0 > maxDay) return [];
    const dateStr = window.ymd(date);
    const [sh, sm] = w.start.split(":").map(Number);
    const [eh, em] = w.end.split(":").map(Number);
    const out = [];
    for (let m = sh * 60 + sm; m + config.slotMinutes <= eh * 60 + em; m += config.slotMinutes) {
      const time = `${window.pad2(Math.floor(m / 60))}:${window.pad2(m % 60)}`;
      const taken = (counts[`${dateStr}T${time}`] || 0) >= capacity;
      // 当日ぶんは過ぎた時刻も閉じる
      const past = new Date(`${dateStr}T${time}:00+09:00`).getTime() <= now.getTime();
      out.push({ time, taken: taken || past });
    }
    return out;
  };
}

/* 本人データを取得して window グローバル（ME/NEXT/COACHING/SLOT_CONFIG）を上書き */
async function loadMyPage() {
  const token = getMpToken();
  if (!token) return { loading: false, ok: false, reason: "no-token" };
  window.MP_TOKEN = token;

  let me, fc;
  try {
    me = await sbRpc("mypage_get", { p_token: token });
    fc = await sbFormConfig();
  } catch (e) {
    return { loading: false, ok: false, reason: "error" };
  }
  if (!me) return { loading: false, ok: false, reason: "invalid" };

  const now = new Date();
  window.MP_NOW = now;

  const t = typeOf(me.test);
  window.ME = {
    name: me.name || "",
    initial: (me.name || "?").trim().charAt(0),
    seg: me.seg,
    segLabel: me.seg === "newgrad" ? "新卒" : "中途",
    job: me.job || "",
    coach: me.coach || "担当",
    coachInitial: (me.coach || "").trim().charAt(0),
    typeCode: t ? t.code : "—",
    typeName: t ? t.name : "未診断",
  };

  // プロファイルシステムから編集された「コーチメッセージ」「表示レイアウト」
  window.MYPAGE_MESSAGE = (me.mypageMessage || "").trim();
  window.MYPAGE_LAYOUT = me.mypageLayout && typeof me.mypageLayout === "object" ? me.mypageLayout : {};

  const upcoming = (me.appointments || [])
    .filter((a) => a.status === "予定" && new Date(a.at).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  let hasNext = false;
  if (upcoming.length) {
    const a = upcoming[0];
    window.NEXT = {
      type: a.type,
      typeLabel: a.type === "first" ? "第一面談" : "第二面談",
      at: new Date(a.at),
      durationMin: (fc && fc.slots && fc.slots.slotMinutes) || 60,
      mode: "online",
      modeLabel: "オンライン",
      // 業務マニュアル上の面談ツールはZoom（コーチがホスト）。予約ページの表記とも揃える
      place: "Zoom",
      url: "",
      coach: a.coach || me.coach || "担当",
    };
    hasNext = true;
  } else {
    window.NEXT = null;
  }

  const co = me.coaching;
  if (co && co.plan && PLAN[co.plan]) {
    const info = PLAN[co.plan];
    const sessions = co.sessions || [];
    let nextSet = false;
    window.COACHING = {
      plan: info.label,
      planDur: info.dur,
      total: info.total,
      done: sessions.filter((s) => s.done).length,
      sessions: sessions.map((s, i) => {
        const isNext = !s.done && !nextSet;
        if (isNext) nextSet = true;
        let dt = "—";
        if (s.date) {
          const p = s.date.split("-");
          dt = p.length === 3 ? Number(p[1]) + "/" + Number(p[2]) : s.date;
        }
        return { no: i + 1, theme: s.theme, date: dt, done: s.done, next: isNext };
      }),
    };
  } else {
    window.COACHING = null;
  }

  if (fc && fc.slots) {
    window.SLOT_CONFIG = fc.slots;
    window.MIN_DAY = window.addDays(window.startOfDay(now), fc.slots.leadDays);
    window.MAX_DAY = window.addDays(window.startOfDay(now), fc.slots.rangeDays);
    const counts = await sbSlotCounts(window.MIN_DAY, window.MAX_DAY);
    window.slotsForDay = buildSlotsForDay(fc.slots, now, counts);
    // 満枠の日を「予約可能」と表示しないよう、空きが1つ以上ある日だけ開ける
    window.dayHasOpen = (date) => window.slotsForDay(date).some((s) => !s.taken);
  }

  // お知らせ（全員共通＋本人個別）をサーバから取得して上書き（失敗時は空に）
  try {
    const anns = await sbRpc("mypage_announcements", { p_token: token });
    window.ANNOUNCEMENTS = Array.isArray(anns) ? anns : [];
  } catch (e) {
    window.ANNOUNCEMENTS = [];
  }

  return { loading: false, ok: true, hasNext };
}

/* 予約作成（本人の予定を1件） */
async function mpBook(atIso, typeCode) {
  return sbRpc("mypage_book", { p_token: window.MP_TOKEN, p_at: atIso, p_type: typeCode });
}

Object.assign(window, { loadMyPage, mpBook, toIsoJST, getMpToken });

/* =========================================================
   日次レポート — Meta広告 ＋ Clarity の結果をLINEグループへ送る

   実行:  node scripts/daily-report.mjs            （送信する）
          node scripts/daily-report.mjs --dry-run  （送らず内容だけ表示）

   認証情報は ~/.config/kanousei-report/secrets.env から読む。
   **リポジトリには絶対に置かない。**

   【重要な制約】
   - Clarity の Data Export API は **1プロジェクト1日10リクエストまで**。
     このスクリプトは1回の実行で1リクエストしか使わない。
   - Clarity は **直近3日ぶんしか遡れない**。毎日実行しないとデータは永久に失われる。
   - Clarity の集計期間は「直近24時間」、Meta は「前日（暦日）」で、
     **期間が完全には一致しない**。誤読しないよう、本文に期間を明記している。
   ========================================================= */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".config", "kanousei-report");
const STATE_FILE = path.join(CONFIG_DIR, "history.json");
const DRY_RUN = process.argv.includes("--dry-run");

/* ---------- 認証情報の読み込み ---------- */
function loadEnv() {
  const f = path.join(CONFIG_DIR, "secrets.env");
  if (!fs.existsSync(f)) throw new Error(`認証情報が見つかりません: ${f}`);
  const env = {};
  for (const line of fs.readFileSync(f, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

/* ---------- 前回の値（前日比を出すため） ---------- */
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")); } catch { return {}; }
}
function saveState(s) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
}

/** 前日比。前回値が無いときは何も出さない（「—」を並べても読みにくいだけ） */
function delta(now, prev, unit = "") {
  if (prev === undefined || prev === null || !isFinite(prev)) return "";
  const d = now - prev;
  if (Math.abs(d) < 1e-9) return "  →±0";
  const sign = d > 0 ? "+" : "−";
  const v = Math.abs(d);
  return `  →${sign}${Number.isInteger(v) ? v : v.toFixed(1)}${unit}`;
}

const n = (v) => (v === undefined || v === null ? 0 : Number(v) || 0);
const yen = (v) => "¥" + Math.round(v).toLocaleString("ja-JP");

/* =========================================================
   Clarity
   ========================================================= */
async function fetchClarity(token) {
  if (!token) return null;
  const url = "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1";
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`Clarity ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const raw = await r.json();

  // metricName をキーにした引きやすい形へ畳む
  const by = {};
  for (const m of raw) by[m.metricName] = m.information || [];
  const first = (k) => (by[k] && by[k][0]) || {};

  const traffic = first("Traffic");
  const sessions = n(traffic.totalSessionCount);
  const bots = n(traffic.totalBotSessionCount);

  /**
   * 上位N件を「名前 件数」で返す。
   * 表示用に名前を丸めてから集計する。丸めた結果が同じもの
   * （例 https://instagram.com/ と https://instagram.com/xxx）は1行にまとめる。
   * しないと同じ名前が並んで読めない。
   */
  const top = (k, nameKey = "name", cntKey = "sessionsCount", limit = 2, norm = (v) => v) => {
    const acc = new Map();
    for (const x of by[k] || []) {
      const name = norm(x[nameKey]);
      if (!name) continue;
      acc.set(name, (acc.get(name) || 0) + n(x[cntKey]));
    }
    return [...acc.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };
  const host = (u) => String(u || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const pathOf = (u) => String(u || "").replace(/^https?:\/\/[^/]+/, "") || "/";

  return {
    sessions,
    bots,
    humanSessions: Math.max(0, sessions - bots),
    users: n(traffic.distinctUserCount),
    pagesPerSession: n(traffic.pagesPerSessionPercentage),
    scrollDepth: n(first("ScrollDepth").averageScrollDepth),
    totalTime: n(first("EngagementTime").totalTime),
    activeTime: n(first("EngagementTime").activeTime),
    // 「困っている合図」。ここが増えたら中身を見に行く
    dead: { total: n(first("DeadClickCount").subTotal), pct: n(first("DeadClickCount").sessionsWithMetricPercentage) },
    rage: { total: n(first("RageClickCount").subTotal), pct: n(first("RageClickCount").sessionsWithMetricPercentage) },
    quickback: { total: n(first("QuickbackClick").subTotal), pct: n(first("QuickbackClick").sessionsWithMetricPercentage) },
    jsError: { total: n(first("ScriptErrorCount").subTotal), pct: n(first("ScriptErrorCount").sessionsWithMetricPercentage) },
    referrers: top("ReferrerUrl", "name", "sessionsCount", 2, host),
    devices: top("Device"),
    pages: top("PopularPages", "url", "visitsCount", 2, pathOf),
  };
}

/* =========================================================
   Meta広告
   ========================================================= */
async function fetchMeta(accountId, token) {
  if (!accountId || !token) return null;
  const acct = accountId.startsWith("act_") ? accountId : `act_${accountId}`;
  const fields = "spend,impressions,clicks,ctr,cpc,frequency,reach,actions,cost_per_action_type";
  const url =
    `https://graph.facebook.com/v21.0/${acct}/insights` +
    `?fields=${fields}&date_preset=yesterday&level=account&access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`Meta ${r.status}: ${j.error?.message || "不明なエラー"}`);
  const d = (j.data && j.data[0]) || null;
  if (!d) return { noData: true };

  // Lead は action_type が lead / offsite_conversion.fb_pixel_lead のいずれかで来る
  const pick = (arr, keys) =>
    n((arr || []).find((a) => keys.includes(a.action_type))?.value);
  const LEAD_KEYS = ["lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"];

  const spend = n(d.spend);
  const leads = pick(d.actions, LEAD_KEYS);
  return {
    spend,
    impressions: n(d.impressions),
    clicks: n(d.clicks),
    ctr: n(d.ctr),
    cpc: n(d.cpc),
    reach: n(d.reach),
    frequency: n(d.frequency),
    leads,
    cpa: leads > 0 ? spend / leads : null,
  };
}

/* =========================================================
   本文の組み立て — スマホのLINEで読める長さに抑える
   ========================================================= */
function buildMessage({ clarity, meta, prev, errors }) {
  const now = new Date(Date.now() + 9 * 3600 * 1000); // JST
  const w = "日月火水木金土"[now.getUTCDay()];
  const head = `📊 日報 ${now.toISOString().slice(0, 10)}（${w}）`;
  const out = [head, ""];

  /* --- 広告 --- */
  out.push("■ 広告 / Meta（前日）");
  if (!meta) {
    out.push("  未設定");
  } else if (meta.noData) {
    out.push("  配信データなし");
  } else {
    const p = prev.meta || {};
    out.push(`  消化      ${yen(meta.spend)}${delta(meta.spend, p.spend)}`);
    out.push(`  表示/クリック ${meta.impressions.toLocaleString()} / ${meta.clicks.toLocaleString()}`);
    out.push(`  CTR / CPC  ${meta.ctr.toFixed(2)}% / ${yen(meta.cpc)}`);
    out.push(`  Lead      ${meta.leads}件${delta(meta.leads, p.leads)}`);
    out.push(`  CPA       ${meta.cpa === null ? "—" : yen(meta.cpa)}`);
  }
  out.push("");

  /* --- サイト --- */
  out.push("■ サイト / Clarity（直近24時間）");
  if (!clarity) {
    out.push("  未設定");
  } else {
    const p = prev.clarity || {};
    out.push(`  セッション  ${clarity.humanSessions}${delta(clarity.humanSessions, p.humanSessions)}`);
    out.push(`  ユーザー   ${clarity.users}${delta(clarity.users, p.users)}`);
    out.push(`  滞在      ${clarity.totalTime}秒（実操作 ${clarity.activeTime}秒）`);
    out.push(`  スクロール到達 ${clarity.scrollDepth.toFixed(1)}%${delta(clarity.scrollDepth, p.scrollDepth, "pt")}`);

    // 0件のものは並べない。異常だけが目に入るようにする
    const trouble = [
      clarity.jsError.total   ? `JSエラー ${clarity.jsError.total}件（${clarity.jsError.pct}%）` : null,
      clarity.rage.total      ? `レイジクリック ${clarity.rage.total}件（${clarity.rage.pct}%）` : null,
      clarity.dead.total      ? `デッドクリック ${clarity.dead.total}件（${clarity.dead.pct}%）` : null,
      clarity.quickback.total ? `即戻り ${clarity.quickback.total}件（${clarity.quickback.pct}%）` : null,
    ].filter(Boolean);
    if (trouble.length) {
      out.push("");
      out.push("■ 気になる点");
      trouble.forEach((t) => out.push(`  ${t}`));
    }

    const line = (label, arr, fmt) =>
      arr.length ? out.push(`  ${label} ${arr.map(fmt).join(" / ")}`) : null;
    out.push("");
    out.push("■ 内訳");
    line("流入", clarity.referrers, (x) => `${x.name} ${x.count}`);
    line("端末", clarity.devices, (x) => `${x.name} ${x.count}`);
    line("ページ", clarity.pages, (x) => `${x.name} ${x.count}`);
  }

  if (errors.length) {
    out.push("");
    out.push("⚠️ 取得できなかったもの");
    errors.forEach((e) => out.push(`  ${e}`));
  }
  return out.join("\n");
}

/* ---------- LINE送信 ---------- */
async function sendLine(token, to, text) {
  const r = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });
  if (!r.ok) throw new Error(`LINE ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

/* ---------- 実行 ---------- */
const env = loadEnv();
const prev = loadState();
const errors = [];

let clarity = null, meta = null;
// 片方が落ちても、もう片方は届けたい。だから個別に catch する
try { clarity = await fetchClarity(env.CLARITY_API_TOKEN); }
catch (e) { errors.push(`Clarity: ${e.message}`); }
try { meta = await fetchMeta(env.META_AD_ACCOUNT_ID, env.META_ACCESS_TOKEN); }
catch (e) { errors.push(`Meta: ${e.message}`); }

const text = buildMessage({ clarity, meta, prev, errors });

if (DRY_RUN) {
  console.log(text);
  console.log("\n--- dry-run のため送信していません ---");
} else {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN || !env.LINE_TARGET_ID) {
    console.error("LINEの設定が足りません（LINE_CHANNEL_ACCESS_TOKEN / LINE_TARGET_ID）");
    process.exit(1);
  }
  await sendLine(env.LINE_CHANNEL_ACCESS_TOKEN, env.LINE_TARGET_ID, text);
  // 送れたときだけ履歴を更新する。失敗した日の値で前日比が狂わないように
  saveState({ date: new Date().toISOString(), clarity, meta });
  console.log("送信しました");
}

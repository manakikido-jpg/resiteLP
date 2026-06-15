/* =========================================================
   候補者マイページ — 共有UIコンポーネント
   ========================================================= */
const { useState, useRef, useEffect, useMemo } = React;

/* --- アイコン（シンプルなライン） --- */
function MPIcon({ name, size = 18, stroke = 2 }) {
  const p = {
    back: <path d="M15 18l-6-6 6-6" />,
    bell: <><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 004 0" /></>,
    cal: <><rect x="3" y="4.5" width="18" height="16" rx="2.4" /><path d="M3 9.5h18M8 3v3M16 3v3" /></>,
    calPlus: <><rect x="3" y="4.5" width="18" height="16" rx="2.4" /><path d="M3 9.5h18M8 3v3M16 3v3M12 13v4M10 15h4" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2.4" /><path d="M16 10l5-3v10l-5-3z" /></>,
    pin: <><path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
    chevR: <path d="M9 6l6 6-6 6" />,
    chevL: <path d="M15 6l-6 6 6 6" />,
    chevDown: <path d="M6 9l6 6 6-6" />,
    check: <path d="M5 12l5 5 9-10" />,
    checkBig: <path d="M5 13l5 5L20 6" />,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 5l4 4" /></>,
    refresh: <><path d="M21 12a9 9 0 11-3-6.7L21 8" /><path d="M21 4v4h-4" /></>,
    spark: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />,
    gift: <><rect x="4" y="9" width="16" height="11" rx="1.6" /><path d="M3 9h18v3H3zM12 9v11M12 9S10.5 4 8 5s.5 4 4 4M12 9s1.5-5 4-4-.5 4-4 4" /></>,
    chart: <><path d="M5 21V4M5 21h16M9 21v-6M13 21V9M17 21v-9" /></>,
    coaching: <><circle cx="12" cy="7" r="3.2" /><path d="M5.5 21a6.5 6.5 0 0113 0" /><path d="M18 6.5l1.4 1.4 2.6-2.6" /></>,
    headset: <><path d="M4 13v-1a8 8 0 0116 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.6" /><rect x="17" y="13" width="4" height="6" rx="1.6" /><path d="M20 19a4 4 0 01-4 4h-3" /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
    external: <><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M19 13v6H5V5h6" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></>,
    moon: <path d="M20 14a8 8 0 11-9-11 6.5 6.5 0 009 11z" />,
  }[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{p}</svg>
  );
}

/* --- アバター --- */
function Avatar({ initial, size = 42, kind = "brand" }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  return <div className="avatar" style={style}>{initial}</div>;
}

/* --- 残り日数の計算（〜まであと N 日） --- */
function countdownLabel(target) {
  const n = window.daysBetween(window.MP_NOW, target);
  if (n === 0) return { big: "本日", small: "まもなく" };
  if (n === 1) return { big: "明日", small: "あと1日" };
  return { big: "あと" + n, small: "日" };
}

/* --- 時間帯の挨拶 --- */
function greetWord() {
  const h = window.MP_NOW.getHours();
  if (h < 11) return "おはようございます";
  if (h < 17) return "こんにちは";
  return "こんばんは";
}

/* --- プログレスバー --- */
function ProgressBar({ pct }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 80); return () => clearTimeout(t); }, [pct]);
  return <div className="cp-bar"><i style={{ width: w + "%" }} /></div>;
}

Object.assign(window, {
  MPIcon, Avatar, countdownLabel, greetWord, ProgressBar,
});

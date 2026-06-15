/* =========================================================
   候補者マイページ — アプリ本体
   画面遷移（ホーム / 予約 / お知らせ詳細）・レイアウト切替・Tweaks
   ========================================================= */

/* アクセントカラー・プリセット */
const ACCENTS = {
  "ブルー":     { brand: "#1379b8", deep: "#1f63a0", c1: "#0e93c9", c2: "#1f63a0", tint: "#eef6fb", tint2: "#e1eef8", ring: "rgba(15,121,184,.18)" },
  "ティール":   { brand: "#0f8f8f", deep: "#0c6f72", c1: "#16a6a0", c2: "#0c6f72", tint: "#e7f5f4", tint2: "#d3ecea", ring: "rgba(15,143,143,.18)" },
  "インディゴ": { brand: "#4f63c4", deep: "#3a47a0", c1: "#5f74dc", c2: "#3a47a0", tint: "#eef0fb", tint2: "#e0e4f6", ring: "rgba(79,99,196,.18)" },
  "グリーン":   { brand: "#2f8a5b", deep: "#246e49", c1: "#39a86c", c2: "#246e49", tint: "#e9f4ee", tint2: "#d9ece0", ring: "rgba(47,138,91,.18)" },
};

/* 表示設定。本番ではサーバ状態（本人の予約有無・お知らせ件数）に置換する。 */
const CONFIG = {
  accent: "ブルー",        // ブランド配色（固定）
  bookingState: "予約あり", // 予約あり / 未予約（本人の次回面談の有無）
  annCount: 3,             // 表示するお知らせ件数
};

/* ---------- お知らせ詳細 ---------- */
function AnnounceDetail({ item, onBack, toast }) {
  const { MPIcon } = window;
  const iconFor = (k) => k === "service" ? "chart" : k === "campaign" ? "gift" : "info";
  return (
    <div>
      <div className="mp-appbar">
        <button className="ab-back" onClick={onBack} aria-label="戻る"><MPIcon name="back" size={18} /></button>
        <div className="ab-title">お知らせ</div>
        <div className="ab-spacer" />
      </div>
      <div className="ann-detail">
        <div className="ad-hero">
          <div className={"ann-ic " + item.tone}><MPIcon name={iconFor(item.kind)} size={22} /></div>
          <div>
            <span className={"badge " + item.tone}>{item.tag}</span>
          </div>
        </div>
        <h1 className="ad-title">{item.title}</h1>
        <span className="ad-date">{window.MP_NOW.getFullYear()}年 {item.date}</span>
        <div className="ad-body">{item.body}</div>
        {item.cta && (
          <button className="btn btn-grad btn-lg btn-block ad-cta" onClick={() => toast(item.cta + "を開きます")}>
            {item.cta}<MPIcon name="arrowRight" size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const t = CONFIG;
  const [screen, setScreen] = useState("home");   // home / booking / announce
  const [ann, setAnn] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastT = useRef(0);
  const stageRef = useRef(null);

  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(null), 2200);
  }

  /* アクセント適用 */
  useEffect(() => {
    const a = ACCENTS[t.accent] || ACCENTS["ブルー"];
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--brand", a.brand);
    el.style.setProperty("--brand-deep", a.deep);
    el.style.setProperty("--brand-grad", `linear-gradient(150deg, ${a.c1} 0%, ${a.c2} 100%)`);
    el.style.setProperty("--brand-tint", a.tint);
    el.style.setProperty("--brand-tint-2", a.tint2);
    el.style.setProperty("--brand-ring", a.ring);
  }, [t.accent]);

  const hasNext = t.bookingState === "予約あり";
  const items = window.ANNOUNCEMENTS.slice(0, t.annCount);

  function openAnn(a) { setAnn(a); setScreen("announce"); window.scrollTo({ top: 0 }); }
  function openBooking() { setScreen("booking"); }
  function home() { setScreen("home"); setAnn(null); }

  const { MPIcon } = window;

  return (
    <div className="mp-stage" ref={stageRef}>
      {/* 端末 */}
      <div className="mp-phone">
        {screen === "booking" ? (
          <window.Booking onClose={home} toast={toast} />
        ) : screen === "announce" && ann ? (
          <AnnounceDetail item={ann} onBack={home} toast={toast} />
        ) : (
          <>
            <div className="mp-appbar">
              <img src="assets/logo-mark.png" alt="可能性ラボ" />
              <div className="ab-title">マイページ</div>
              <div className="ab-spacer" />
              <button className="ab-bell" onClick={() => toast("お知らせを表示")} aria-label="お知らせ">
                <MPIcon name="bell" size={18} />
                {items.length > 0 && <span className="nbadge" />}
              </button>
            </div>
            <window.HomeA onBook={openBooking} onOpenAnn={openAnn} toast={toast} items={items} hasNext={hasNext} />
          </>
        )}

        {toastMsg && <div className="toast"><MPIcon name="check" size={16} stroke={2.4} />{toastMsg}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { App });

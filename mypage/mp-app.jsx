/* =========================================================
   候補者マイページ — アプリ本体
   token で本人データを取得 → ホーム / 予約 / お知らせ詳細
   ========================================================= */

/* ---------- お知らせ詳細 ---------- */
function AnnounceDetail({ item, onBack, toast }) {
  const { MPIcon } = window;
  const iconFor = (k) => (k === "service" ? "chart" : k === "campaign" ? "gift" : "info");
  return (
    <div>
      <div className="mp-appbar">
        <button className="ab-back" onClick={onBack} aria-label="戻る"><MPIcon name="back" size={18} /></button>
        <div className="ab-title">お知らせ</div>
        <div className="ab-spacer" />
      </div>
      <div className="ann-detail">
        <div className="ad-hero">
          <div className={"ann-ic " + window.annTone(item)}><MPIcon name={iconFor(item.kind)} size={22} /></div>
          <div><span className={"badge " + window.annTone(item)}>{item.tag}</span></div>
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

/* ---------- 読み込み中 ---------- */
function LoadingScreen() {
  return (
    <div className="mp-center">
      <div className="mp-spinner" />
      <div className="mp-center-tx">読み込んでいます…</div>
    </div>
  );
}

/* ---------- 入口エラー（token 無効など） ---------- */
function ErrorScreen({ reason }) {
  const { MPIcon } = window;
  const msg =
    reason === "no-token"
      ? "マイページのリンクが正しくありません。LINEに届いた専用リンクからお開きください。"
      : reason === "invalid"
        ? "このリンクは無効か、有効期限が切れています。お手数ですが担当コーチへご連絡ください。"
        : "読み込みに失敗しました。通信環境をご確認のうえ、時間をおいて再度お試しください。";
  return (
    <div className="mp-center">
      <div className="mp-center-ic"><MPIcon name="info" size={28} /></div>
      <div className="mp-center-ttl">ページを表示できません</div>
      <div className="mp-center-tx">{msg}</div>
    </div>
  );
}

function App() {
  const [boot, setBoot] = useState({ loading: true });
  const [screen, setScreen] = useState("home");   // home / booking / announce
  const [ann, setAnn] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastT = useRef(0);

  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(null), 2200);
  }

  // 起動：token で本人データ取得
  useEffect(() => {
    window
      .loadMyPage()
      .then(setBoot)
      .catch(() => setBoot({ loading: false, ok: false, reason: "error" }));
  }, []);

  function refresh() {
    window.loadMyPage().then(setBoot).catch(() => {});
  }
  function openAnn(a) { setAnn(a); setScreen("announce"); window.scrollTo({ top: 0 }); }
  function openBooking() { setScreen("booking"); }
  function home() { setScreen("home"); setAnn(null); refresh(); }

  const { MPIcon } = window;
  const items = window.ANNOUNCEMENTS || [];
  const hasNext = !!boot.hasNext;

  return (
    <div className="mp-stage">
      <div className="mp-phone">
        {boot.loading ? (
          <LoadingScreen />
        ) : !boot.ok ? (
          <ErrorScreen reason={boot.reason} />
        ) : screen === "booking" ? (
          <window.Booking onClose={home} toast={toast} />
        ) : screen === "announce" && ann ? (
          <AnnounceDetail item={ann} onBack={home} toast={toast} />
        ) : (
          <>
            <div className="mp-appbar">
              <img src="assets/logo-mark.png" alt="可能性ラボ" />
              <div className="ab-title">マイページ</div>
              <div className="ab-spacer" />
              <button className="ab-bell" onClick={() => toast("お知らせはこの下に表示されています")} aria-label="お知らせ">
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

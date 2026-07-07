/* =========================================================
   候補者マイページ — ホーム（レイアウト A / B / C 共通部品 + 各レイアウト）
   ========================================================= */

/* ---------- 次回面談：グラデーション・ヒーロー（A / B） ---------- */
function NextHero({ onReschedule, toast, compact }) {
  const { NEXT, WD, fmtTime, countdownLabel, MPIcon } = window;
  const cd = countdownLabel(NEXT.at);
  const d = NEXT.at;
  return (
    <div className="next-grad">
      <div className="ng-top">
        <span className="ng-eyebrow">次回の面談</span>
        <span className="ng-count"><b>{cd.big}</b><small>{cd.small}</small></span>
      </div>
      <div className="ng-date">
        <span className="d-main">{d.getMonth() + 1}/{d.getDate()}</span>
        <span className="d-wd">（{WD[d.getDay()]}）</span>
        <span className="d-time">{fmtTime(d)}</span>
      </div>
      <div className="ng-meta">
        <span className="ng-pill"><MPIcon name="list" size={14} />{NEXT.typeLabel}</span>
        <span className="ng-pill"><MPIcon name="video" size={14} />{NEXT.modeLabel}</span>
        <span className="ng-pill"><MPIcon name="user" size={14} />{NEXT.coach} コーチ</span>
      </div>
      {!compact && NEXT.url && (
        <div className="join-row">
          <MPIcon name="video" size={16} />
          <span className="url">{NEXT.url}</span>
        </div>
      )}
      <div className="ng-actions">
        <button className="btn btn-white" onClick={() => toast("当日リンクをLINEにお送りします")}>
          <MPIcon name="video" size={16} />参加する
        </button>
        <button className="btn btn-white" onClick={() => toast("カレンダーに追加しました")}>
          <MPIcon name="calPlus" size={16} />追加
        </button>
        <button className="btn btn-white" onClick={onReschedule} aria-label="日程変更">
          <MPIcon name="refresh" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------- 次回面談：ライトカード（C） ---------- */
function NextCardLight({ onReschedule, toast }) {
  const { NEXT, WD, fmtTime, countdownLabel, MPIcon } = window;
  const cd = countdownLabel(NEXT.at);
  const d = NEXT.at;
  return (
    <div className="card next-card">
      <div className="nc-top">
        <span className="eyebrow">次回の面談</span>
        <span className="badge info"><MPIcon name="clock" size={13} />{cd.big}{cd.small === "日" ? cd.small : ""}</span>
      </div>
      <div className="nc-date">
        <span className="d-main">{d.getMonth() + 1}/{d.getDate()}</span>
        <span className="d-wd">（{WD[d.getDay()]}）</span>
        <span className="d-time">{fmtTime(d)}</span>
      </div>
      <div className="nc-meta">
        <div className="row"><span className="k"><MPIcon name="list" size={14} />種別</span><span className="v">{NEXT.typeLabel}</span></div>
        <div className="row"><span className="k"><MPIcon name="video" size={14} />形式</span><span className="v">{NEXT.modeLabel}・{NEXT.place}</span></div>
        <div className="row"><span className="k"><MPIcon name="user" size={14} />担当</span><span className="v">{NEXT.coach} コーチ</span></div>
      </div>
      <div className="nc-actions">
        <button className="btn btn-primary" onClick={() => toast("当日リンクをLINEにお送りします")}><MPIcon name="video" size={16} />参加する</button>
        <button className="btn" onClick={() => toast("カレンダーに追加しました")}><MPIcon name="calPlus" size={16} />追加</button>
        <button className="btn" onClick={onReschedule} aria-label="日程変更"><MPIcon name="refresh" size={16} /></button>
      </div>
    </div>
  );
}

/* ---------- コーチング進捗 ---------- */
function CoachingCard({ slim }) {
  const { COACHING, ProgressBar, MPIcon } = window;
  const pct = Math.round((COACHING.done / COACHING.total) * 100);
  return (
    <div className="card coach-card">
      <div className="coach-top">
        <span className="coach-plan"><MPIcon name="coaching" size={17} />{COACHING.plan}コース<span className="dur">{COACHING.planDur}</span></span>
        <span className="coach-frac"><b>{COACHING.done}</b>/{COACHING.total}回</span>
      </div>
      <ProgressBar pct={pct} />
      {!slim && (
        <div className="coach-sessions">
          {COACHING.sessions.map((s) => (
            <div className="cs-row" key={s.no}>
              <span className={"cs-no" + (s.done ? " done" : s.next ? " next" : "")}>
                {s.done ? <MPIcon name="check" size={13} stroke={2.6} /> : s.no}
              </span>
              <div className="cs-main">
                <div className="cs-theme">{s.theme}</div>
                <div className="cs-date">{s.date}</div>
              </div>
              {s.done && <span className="cs-tag done">完了</span>}
              {s.next && <span className="cs-tag next">次回</span>}
            </div>
          ))}
        </div>
      )}
      {slim && (
        <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--ink-2)" }}>
          次回 <b style={{ color: "var(--brand-deep)" }}>{COACHING.sessions.find((s) => s.next).theme}</b>（{COACHING.sessions.find((s) => s.next).date}）
        </div>
      )}
    </div>
  );
}

/* お知らせの色トーン（未設定は種別から補完） */
function annTone(a) {
  if (a && a.tone) return a.tone;
  const k = a && a.kind;
  return k === "service" ? "cyan" : k === "campaign" ? "warn" : "info";
}

/* ---------- アナウンス：カード型（A / B） ---------- */
function AnnouncementsFeed({ items, onOpen }) {
  const { MPIcon } = window;
  const iconFor = (k) => k === "service" ? "chart" : k === "campaign" ? "gift" : "info";
  return (
    <div className="ann-list">
      {items.map((a) => (
        <button className="ann-item" key={a.id} onClick={() => onOpen(a)}>
          <div className={"ann-ic " + annTone(a)}><MPIcon name={iconFor(a.kind)} size={20} /></div>
          <div className="ann-main">
            <div className="ann-metarow">
              <span className="ann-date">{a.date}</span>
              {a.pinned
                ? <span className="ann-pin"><MPIcon name="pin" size={11} />固定</span>
                : <span className="badge muted" style={{ fontSize: 10, padding: "1px 8px" }}>{a.tag}</span>}
            </div>
            <div className="ann-title">{a.title}</div>
            <div className="ann-lead">{a.lead}</div>
            {a.cta && <span className="ann-cta">{a.cta}<MPIcon name="arrowRight" size={14} /></span>}
          </div>
          <span className="ann-chev"><MPIcon name="chevR" size={18} /></span>
        </button>
      ))}
    </div>
  );
}

/* ---------- アナウンス：コンパクト行（C） ---------- */
function AnnouncementsRows({ items, onOpen }) {
  return (
    <div className="card" style={{ padding: "4px 16px" }}>
      <div className="ann-rows">
        {items.map((a) => (
          <button className="ann-rowitem" key={a.id} onClick={() => onOpen(a)}>
            <span className={"dot " + a.tone} />
            <div className="r-main">
              <div className="r-title">{a.title}</div>
              <div className="r-tag">{a.tag}</div>
            </div>
            <span className="r-date">{a.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- グリーティング ---------- */
function Greeting({ big }) {
  const { ME, greetWord, Avatar } = window;
  return (
    <div className="greet">
      <Avatar initial={ME.initial} size={big ? 50 : 48} />
      <div className="g-main">
        <div className="g-hello">{greetWord()}、{ME.name.split(" ")[1]}さん</div>
        <div className="g-sub">{ME.segLabel}・{ME.job}</div>
      </div>
      <span className="typechip"><span className="code">{ME.typeCode}</span><span className="nm">{ME.typeName}</span></span>
    </div>
  );
}

/* ---------- 次回面談がない状態 ---------- */
function NextEmpty({ onBook, grad }) {
  const { MPIcon } = window;
  if (grad) {
    return (
      <div className="next-grad">
        <div className="ng-top"><span className="ng-eyebrow">次回の面談</span></div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>予約はまだありません</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginBottom: 16 }}>キャリア面談は何度でも無料。ご都合のよい日時で予約してください。</div>
        <button className="btn btn-white btn-lg btn-block" onClick={onBook}><MPIcon name="calPlus" size={18} />面談を予約する</button>
      </div>
    );
  }
  return (
    <div className="card next-card" style={{ borderLeftColor: "var(--ink-4)" }}>
      <span className="eyebrow">次回の面談</span>
      <div style={{ fontSize: 17, fontWeight: 800, margin: "8px 0 4px" }}>予約はまだありません</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginBottom: 16 }}>カレンダーから空き枠を選んで予約できます。</div>
      <button className="btn btn-primary btn-lg btn-block" onClick={onBook}><MPIcon name="calPlus" size={18} />面談を予約する</button>
    </div>
  );
}

/* ---------- クイックアクション ---------- */
function QuickActions({ onBook, toast }) {
  const { MPIcon } = window;
  return (
    <div className="quick">
      <button onClick={onBook}><span className="qi"><MPIcon name="calPlus" size={20} /></span><span className="ql">面談を予約</span></button>
      <button onClick={() => toast("市場価値診断を開きます")}><span className="qi"><MPIcon name="chart" size={20} /></span><span className="ql">市場価値診断</span></button>
      <button onClick={() => toast("コーチに相談する")}><span className="qi"><MPIcon name="headset" size={20} /></span><span className="ql">相談する</span></button>
    </div>
  );
}

/* ---------- 予約導線カード ---------- */
function BookCTA({ onBook }) {
  const { MPIcon } = window;
  return (
    <button className="book-cta" onClick={onBook} style={{ width: "100%", textAlign: "left" }}>
      <span className="bc-ic"><MPIcon name="calPlus" size={22} /></span>
      <span className="bc-main"><b>別の日程でも予約できます</b><span>カレンダーから空き枠を選ぶ</span></span>
      <span className="ann-chev"><MPIcon name="chevR" size={18} /></span>
    </button>
  );
}

/* ---------- コーチからのメッセージ（プロファイルシステムで編集） ---------- */
function CoachMessage() {
  const { MYPAGE_MESSAGE, ME, MPIcon } = window;
  if (!MYPAGE_MESSAGE) return null;
  return (
    <div className="card coach-msg">
      <div className="cm-head"><span className="cm-ic"><MPIcon name="coaching" size={15} /></span>{ME.coach} コーチより</div>
      <p className="cm-body">{MYPAGE_MESSAGE}</p>
    </div>
  );
}

/* レイアウト設定（MYPAGE_LAYOUT.sections）を解決。未設定は既定順で全表示 */
const MP_SECTION_KEYS = ["message", "next", "quick", "coaching", "news", "bookcta"];
function mpResolveSections() {
  const layout = window.MYPAGE_LAYOUT || {};
  const stored = Array.isArray(layout.sections)
    ? layout.sections.filter((s) => s && MP_SECTION_KEYS.includes(s.key))
    : [];
  if (!stored.length) return MP_SECTION_KEYS.map((key) => ({ key, on: true }));
  const onMap = new Map(stored.map((s) => [s.key, s.on]));
  const order = [...stored.map((s) => s.key), ...MP_SECTION_KEYS.filter((k) => !onMap.has(k))];
  return order.map((key) => ({ key, on: onMap.has(key) ? !!onMap.get(key) : true }));
}

/* =========================================================
   レイアウト A — フィード型（表示順・ON/OFF はプロファイルから制御）
   ========================================================= */
function HomeA({ onBook, onOpenAnn, toast, items, hasNext }) {
  const { MPIcon } = window;
  const sections = mpResolveSections().filter((s) => s.on);
  const renderSection = (key) => {
    switch (key) {
      case "message":
        return <CoachMessage key="message" />;
      case "next":
        return (
          <React.Fragment key="next">
            {hasNext ? <NextHero onReschedule={onBook} toast={toast} /> : <NextEmpty onBook={onBook} grad />}
          </React.Fragment>
        );
      case "quick":
        return <QuickActions key="quick" onBook={onBook} toast={toast} />;
      case "coaching":
        return window.COACHING ? (
          <React.Fragment key="coaching">
            <div className="sec-head"><MPIcon name="coaching" size={16} /><h2>コーチングの進捗</h2><span className="line" /></div>
            <CoachingCard />
          </React.Fragment>
        ) : null;
      case "news":
        return items && items.length ? (
          <React.Fragment key="news">
            <div className="sec-head"><MPIcon name="bell" size={16} /><h2>お知らせ</h2><span className="line" /></div>
            <AnnouncementsFeed items={items} onOpen={onOpenAnn} />
          </React.Fragment>
        ) : null;
      case "bookcta":
        return <BookCTA key="bookcta" onBook={onBook} />;
      default:
        return null;
    }
  };
  return (
    <div className="mp-body">
      <Greeting />
      {sections.map((s) => renderSection(s.key))}
    </div>
  );
}

/* =========================================================
   レイアウト B — 集約ヘッダー型
   ========================================================= */
function HomeB({ onBook, onOpenAnn, toast, items, hasNext }) {
  return (
    <>
      <div className="mp-body" style={{ paddingBottom: 96 }}>
        <Greeting big />
        {hasNext ? <NextHero onReschedule={onBook} toast={toast} /> : <NextEmpty onBook={onBook} grad />}
        <div className="sec-head"><h2>コーチングの進捗</h2><span className="line" /></div>
        <CoachingCard />
        <div className="sec-head"><h2>お知らせ</h2><span className="line" /><span className="more">すべて<MPIcon name="chevR" size={13} /></span></div>
        <AnnouncementsFeed items={items} onOpen={onOpenAnn} />
      </div>
      <div style={{ position: "sticky", bottom: 0, padding: "12px 18px 16px", background: "linear-gradient(to top, var(--bg) 70%, transparent)", zIndex: 20 }}>
        <button className="btn btn-grad btn-lg btn-block" onClick={onBook}><MPIcon name="calPlus" size={18} />面談を予約する</button>
      </div>
    </>
  );
}

/* =========================================================
   レイアウト C — ミニマル・カード型
   ========================================================= */
function HomeC({ onBook, onOpenAnn, toast, items, hasNext }) {
  return (
    <div className="mp-body" style={{ gap: 22 }}>
      <Greeting />
      {hasNext ? <NextCardLight onReschedule={onBook} toast={toast} /> : <NextEmpty onBook={onBook} />}
      <div>
        <div className="sec-head" style={{ marginBottom: 12 }}><span className="eyebrow">Coaching</span><span className="line" /></div>
        <CoachingCard slim />
      </div>
      <div>
        <div className="sec-head" style={{ marginBottom: 12 }}><span className="eyebrow">News</span><span className="line" /></div>
        <AnnouncementsRows items={items} onOpen={onOpenAnn} />
      </div>
      <button className="btn btn-primary btn-lg btn-block" onClick={onBook}><MPIcon name="calPlus" size={18} />面談を予約する</button>
    </div>
  );
}

Object.assign(window, { HomeA, HomeB, HomeC, AnnouncementsFeed, annTone });

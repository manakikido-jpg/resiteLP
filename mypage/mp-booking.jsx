/* =========================================================
   候補者マイページ — 面談予約フロー
   日付（カレンダー）→ 時間枠 → 確認 → 完了
   ========================================================= */

function Booking({ onClose, toast, accent }) {
  const {
    MP_NOW, WD, ymd, fmtTime, fmtDateJP, fmtMonthJP, monthGrid,
    startOfDay, startOfMonth, sameDay, slotsForDay, dayHasOpen,
    MIN_DAY, MAX_DAY, MPIcon, ME,
  } = window;

  const [step, setStep] = useState(1);            // 1 日付 / 2 時間 / 3 確認 / 4 完了
  const [month, setMonth] = useState(startOfMonth(MP_NOW));
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [type, setType] = useState("第二面談");
  const [mode, setMode] = useState("オンライン");

  const minMonth = startOfMonth(MIN_DAY);
  const maxMonth = startOfMonth(MAX_DAY);
  const canPrev = month > minMonth;
  const canNext = month < maxMonth;

  const grid = useMemo(() => monthGrid(month), [month.getTime()]);
  const slots = useMemo(() => (day ? slotsForDay(day) : []), [day && day.getTime()]);
  const morning = slots.filter((s) => parseInt(s.time) < 12);
  const afternoon = slots.filter((s) => parseInt(s.time) >= 12);

  function pickDay(d) {
    setDay(d); setSlot(null); setStep(2);
  }
  function pickSlot(s) {
    if (s.taken) return;
    setSlot(s); setStep(3);
  }
  function goBack() {
    if (step === 1) { onClose(); return; }
    if (step === 4) { onClose(); return; }
    setStep(step - 1);
  }
  function confirm() {
    setStep(4);
    if (toast) toast("予約が完了しました");
  }

  const selStart = day && slot ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), ...slot.time.split(":").map(Number)) : null;

  /* ---------- 完了画面 ---------- */
  if (step === 4) {
    return (
      <div className="done-screen">
        <div className="done-check"><MPIcon name="checkBig" size={40} stroke={2.4} /></div>
        <h2>予約が完了しました</h2>
        <p>確認のメッセージをLINEにお送りしました。<br />当日お会いできるのを楽しみにしています。</p>
        <div className="done-detail">
          <div className="confirm-card">
            <div className="confirm-row">
              <span className="ck"><MPIcon name="cal" size={15} />日時</span>
              <span className="cv">{fmtDateJP(day)}（{WD[day.getDay()]}）<span className="sub"> ・ {slot.time}〜</span></span>
            </div>
            <div className="confirm-row">
              <span className="ck"><MPIcon name="list" size={15} />種別</span>
              <span className="cv">{type}</span>
            </div>
            <div className="confirm-row">
              <span className="ck"><MPIcon name="user" size={15} />担当</span>
              <span className="cv">{ME.coach}</span>
            </div>
            <div className="confirm-row">
              <span className="ck"><MPIcon name="video" size={15} />形式</span>
              <span className="cv">{mode}</span>
            </div>
          </div>
        </div>
        <div className="book-footer" style={{ width: "100%", marginTop: 6 }}>
          <button className="btn btn-lg" onClick={() => toast && toast("カレンダーに追加しました")}>
            <MPIcon name="calPlus" size={17} />カレンダーに追加
          </button>
          <button className="btn btn-primary btn-lg flex2" onClick={onClose}>ホームに戻る</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mp-appbar">
        <button className="ab-back" onClick={goBack} aria-label="戻る"><MPIcon name="back" size={18} /></button>
        <div className="ab-title">面談を予約</div>
        <div className="ab-spacer" />
      </div>

      <div className="booking">
        {/* ステップ表示 */}
        <div className="steps">
          {[["1", "日付"], ["2", "時間"], ["3", "確認"]].map(([n, lb], i) => {
            const sn = i + 1;
            const cls = step === sn ? "on" : step > sn ? "done" : "";
            return (
              <React.Fragment key={n}>
                {i > 0 && <div className={"step-sep" + (step > i ? " done" : "")} />}
                <button className={"step " + cls} onClick={() => { if (step > sn) setStep(sn); }} style={{ border: 0, background: "none" }}>
                  <span className="s-no">{step > sn ? <MPIcon name="check" size={13} stroke={2.6} /> : n}</span>
                  <span className="s-lb">{lb}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* STEP 1: 日付 */}
        {step === 1 && (
          <>
            <div>
              <h1 className="book-h">ご希望の日を選択</h1>
              <p className="book-sub">面談は約60分・オンラインで実施します。空きのある日（●）をお選びください。</p>
            </div>
            <div className="bk-cal">
              <div className="bk-cal-head">
                <button onClick={() => canPrev && setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={!canPrev}><MPIcon name="chevL" size={18} /></button>
                <span className="m">{fmtMonthJP(month)}</span>
                <button onClick={() => canNext && setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} disabled={!canNext}><MPIcon name="chevR" size={18} /></button>
              </div>
              <div className="bk-wd">
                {WD.map((w, i) => <span key={w} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>{w}</span>)}
              </div>
              <div className="bk-grid">
                {grid.flat().map((d, i) => {
                  const inMonth = d.getMonth() === month.getMonth();
                  const open = dayHasOpen(d);
                  const isToday = sameDay(d, MP_NOW);
                  const sel = day && sameDay(d, day);
                  let cls = "bk-day";
                  if (!inMonth) cls += " out";
                  else if (!open) cls += " disabled";
                  else cls += " avail";
                  if (sel) cls += " sel";
                  if (isToday) cls += " today";
                  return (
                    <button key={i} className={cls} onClick={() => open && inMonth && pickDay(d)}>
                      {inMonth ? d.getDate() : ""}
                      {inMonth && open && <span className="dot" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bk-legend">
              <span><span className="lg-dot" />予約可能</span>
              <span style={{ color: "var(--ink-4)" }}>—　休止・満枠</span>
            </div>
          </>
        )}

        {/* STEP 2: 時間 */}
        {step === 2 && day && (
          <>
            <div>
              <h1 className="book-h">時間を選択</h1>
              <p className="book-sub">ご都合のよい開始時間をお選びください。</p>
            </div>
            <div className="bk-daylabel">
              <div className="dl-cal">
                <span className="mm">{day.getMonth() + 1}月</span>
                <span className="dd">{day.getDate()}</span>
              </div>
              <div className="dl-main">
                <b>{fmtDateJP(day)}（{WD[day.getDay()]}）</b>
                <span>空き {slots.filter((s) => !s.taken).length} 枠</span>
              </div>
            </div>
            {slots.length === 0 && <div className="slot-empty">この日は受付がありません。</div>}
            {morning.length > 0 && (
              <div className="slot-group">
                <div className="sg-label"><MPIcon name="sun" size={15} />午前</div>
                <div className="slot-grid">
                  {morning.map((s) => (
                    <button key={s.time} className={"slot" + (s.taken ? " taken" : "") + (slot && slot.time === s.time ? " sel" : "")} onClick={() => pickSlot(s)}>{s.time}</button>
                  ))}
                </div>
              </div>
            )}
            {afternoon.length > 0 && (
              <div className="slot-group">
                <div className="sg-label"><MPIcon name="clock" size={15} />午後</div>
                <div className="slot-grid">
                  {afternoon.map((s) => (
                    <button key={s.time} className={"slot" + (s.taken ? " taken" : "") + (slot && slot.time === s.time ? " sel" : "")} onClick={() => pickSlot(s)}>{s.time}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 3: 確認 */}
        {step === 3 && day && slot && (
          <>
            <div>
              <h1 className="book-h">予約内容の確認</h1>
              <p className="book-sub">内容をご確認のうえ、予約を確定してください。</p>
            </div>
            <div className="confirm-card">
              <div className="confirm-row">
                <span className="ck"><MPIcon name="cal" size={15} />日時</span>
                <span className="cv">{fmtDateJP(day)}（{WD[day.getDay()]}）<span className="sub"> ・ {slot.time}〜{addHour(slot.time)}</span></span>
              </div>
              <div className="confirm-row">
                <span className="ck"><MPIcon name="list" size={15} />種別</span>
                <span className="cv">
                  <span className="seg-pick">
                    {["第一面談", "第二面談"].map((t) => (
                      <button key={t} className={type === t ? "on" : ""} onClick={() => setType(t)}>{t}</button>
                    ))}
                  </span>
                </span>
              </div>
              <div className="confirm-row">
                <span className="ck"><MPIcon name="user" size={15} />担当</span>
                <span className="cv">{ME.coach}<span className="sub"> コーチ</span></span>
              </div>
              <div className="confirm-row">
                <span className="ck"><MPIcon name="video" size={15} />形式</span>
                <span className="cv">
                  <span className="seg-pick">
                    {["オンライン", "来社"].map((m) => (
                      <button key={m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>{m}</button>
                    ))}
                  </span>
                </span>
              </div>
            </div>
            <div className="book-footer">
              <button className="btn btn-lg" onClick={() => setStep(2)}>戻る</button>
              <button className="btn btn-grad btn-lg flex2" onClick={confirm}>この内容で予約する</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function addHour(t) {
  const [h, m] = t.split(":").map(Number);
  return window.pad2((h + 1) % 24) + ":" + window.pad2(m);
}

Object.assign(window, { Booking });

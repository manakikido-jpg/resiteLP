// ============================================================
// 結果画面レンダリング（紙トレカ / 活版 — データ駆動）
// ============================================================
(function(){
  const TT = window.TYPETEST;
  const { TYPES, RARITY, statProfile } = TT;
  const rankWord = r => r==='UR'?'ULTRA RARE':r==='SSR'?'SUPER RARE+':r==='SR'?'SUPER RARE':'RARE';

  function poles(code){
    return [ code[0]==='S'?'戦略':'共感', code[1]==='T'?'チーム':'個人',
             code[2]==='O'?'論理':'直感', code[3]==='P'?'楽観':'悲観' ];
  }

  function renderResult(result){
    const { code, scores, type:t } = result;
    window.__lastResult = result;
    const stats = statProfile(scores);
    const good = TYPES[t.good], bad = TYPES[t.bad];

    const statRows = stats.map(s=>`
      <div class="r-stat">
        <span class="r-stat-n">${s.name}</span>
        <span class="r-stat-bar"><i style="width:${s.value}%"></i></span>
        <span class="r-stat-v">${s.value}</span>
      </div>`).join('');

    const strengths = t.strengths.map(s=>`
      <div class="r-sw-item r-good"><span class="r-sw-mk">＋</span>
        <div class="r-sw-tx"><b>${s.title}</b><span>${s.body}</span></div></div>`).join('');

    const weaknesses = t.weaknesses.map(s=>`
      <div class="r-sw-item r-bad"><span class="r-sw-mk">！</span>
        <div class="r-sw-tx"><b>${s.title}</b><span>${s.body}</span></div></div>`).join('');

    const jobs = t.jobs.map(j=>`<span class="r-job">${j}</span>`).join('');
    const axes = poles(code).map(p=>`<span class="r-ax">${p}</span>`).join('');

    // ----- 連携（INTEGRATION.md §2・§3）-----
    const linkCode = TT.encodeCode(scores);                    // 4文字コード（軸スコア符号化）
    const bookingUrl = TT.LINK.BOOKING_URL + '?code=' + encodeURIComponent(linkCode);
    window.__linkCode = linkCode;

    return `
    <section class="r-wrap">
      <div class="r-card">
        <div class="r-band">
          <span class="r-band-no">No.${t.no} ／ ${t.code}</span>
          <span class="r-band-rare"><span class="r-stars">${RARITY[t.rank]}</span><span class="r-rk">${t.rank}</span></span>
        </div>
        <div class="r-rarememo">出現率 <b>${t.pct}%</b> ／ ${t.rank==='UR'?'ULTRA RARE':t.rank==='SSR'?'SUPER RARE+':t.rank==='SR'?'SUPER RARE':'RARE'}</div>

        <div class="r-char">
          <div class="r-char-axis">${axes}</div>
          <div class="r-emo">${t.emoji}</div>
          <div class="r-ph">CHARACTER ILLUSTRATION</div>
          <div class="r-stamp">${t.rank}</div>
        </div>

        <div class="r-plate">
          <div class="r-copy">${t.copy}</div>
          <div class="r-name">${t.name}</div>
          <div class="r-en">${t.en}</div>
        </div>
        <div class="r-rule"></div>

        <div class="r-body">
          <div class="r-sec">
            <div class="r-lbl"><span class="en">STATUS</span><span class="jp">能力ステータス</span></div>
            ${statRows}
          </div>
          <div class="r-sec">
            <div class="r-lbl"><span class="en">CHARACTER</span><span class="jp">タイプ解説</span></div>
            <p class="r-blurb">${t.blurb}</p>
          </div>
          <div class="r-sec">
            <div class="r-lbl"><span class="en">STRENGTH</span><span class="jp">強み</span></div>
            <div class="r-sw">${strengths}</div>
          </div>
          <div class="r-sec">
            <div class="r-lbl"><span class="en">WEAKNESS</span><span class="jp">弱み・注意点</span></div>
            <div class="r-sw">${weaknesses}</div>
          </div>
          <div class="r-sec">
            <div class="r-lbl"><span class="en">JOBS</span><span class="jp">向いている職業</span></div>
            <div class="r-jobs">${jobs}</div>
          </div>
          <div class="r-sec">
            <div class="r-lbl"><span class="en">COMPATIBILITY</span><span class="jp">相性</span></div>
            <div class="r-compat">
              <div class="r-cc good"><div class="r-cc-l">◎ 相性が良い</div><div class="r-cc-e">${good.emoji}</div><div class="r-cc-n">${good.name}</div><div class="r-cc-c">${good.code}</div></div>
              <div class="r-cc bad"><div class="r-cc-l">△ 噛み合いにくい</div><div class="r-cc-e">${bad.emoji}</div><div class="r-cc-n">${bad.name}</div><div class="r-cc-c">${bad.code}</div></div>
            </div>
          </div>
          <div class="r-sec">
            <div class="r-lbl"><span class="en">HOW TO GROW</span><span class="jp">才能の伸ばし方</span></div>
            <p class="r-grow">${t.grow}</p>
          </div>

          <div class="r-sec r-link-sec">
            <div class="r-lbl"><span class="en">LINK CODE</span><span class="jp">コーチ連携コード</span></div>
            <div class="r-link">
              <div class="r-link-code" id="rLinkCode">${linkCode}</div>
              <button class="r-link-copy" id="rCopyCode">コピー</button>
            </div>
            <p class="r-link-note">面談時にこのコードをコーチへ伝えてください。</p>
          </div>

          <div class="r-ctas">
            <a class="r-cta" id="rBooking" href="${bookingUrl}">この結果をふまえてキャリア相談を予約する</a>
            <div class="r-cta-row">
              <button class="r-cta-s" id="rShare">結果をシェア</button>
              <button class="r-cta-s" id="rSave">画像で保存</button>
              <button class="r-cta-s" id="rRetry">もう一度</button>
            </div>
            <a class="r-cta-link" href="types.html">▸ 16タイプ図鑑をすべて見る</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  function bindResult(opts={}){
    document.getElementById('rRetry')?.addEventListener('click', ()=> opts.onRetry ? opts.onRetry() : location.reload());

    // 連携コードのコピー（経路A）
    const copyBtn = document.getElementById('rCopyCode');
    copyBtn?.addEventListener('click', async ()=>{
      const code = document.getElementById('rLinkCode')?.textContent?.trim() || '';
      try{
        if(navigator.clipboard?.writeText){ await navigator.clipboard.writeText(code); }
        else{
          const ta = document.createElement('textarea'); ta.value = code;
          ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta);
          ta.select(); document.execCommand('copy'); ta.remove();
        }
        copyBtn.textContent = 'コピーしました ✓';
      }catch(e){ copyBtn.textContent = '失敗'; }
      setTimeout(()=>{ copyBtn.textContent = 'コピー'; }, 1600);
    });

    const saveBtn = document.getElementById('rSave');
    saveBtn?.addEventListener('click', async ()=>{
      const lbl = saveBtn.textContent;
      saveBtn.textContent = '書き出し中…'; saveBtn.disabled = true;
      try{
        const url = await captureResult();
        const a = document.createElement('a');
        a.href = url; a.download = `kanousei-result-${window.__lastResult?.code||'type'}.png`; a.click();
        saveBtn.textContent = '保存しました ✓';
      }catch(e){ console.error(e); saveBtn.textContent = '失敗（再試行）'; }
      setTimeout(()=>{ saveBtn.textContent = lbl; saveBtn.disabled=false; }, 1800);
    });

    const shareBtn = document.getElementById('rShare');
    shareBtn?.addEventListener('click', async ()=>{
      const lbl = shareBtn.textContent; shareBtn.textContent = '準備中…'; shareBtn.disabled = true;
      try{
        const url = await captureResult();
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], 'kanousei-result.png', { type:'image/png' });
        if(navigator.canShare && navigator.canShare({ files:[file] })){
          await navigator.share({ files:[file], title:'私の職業タイプ', text:'#職業タイプ診断 ｜可能性LABO' });
        }else{
          const w = window.open(); if(w) w.document.write(`<img src="${url}" style="max-width:100%">`);
        }
        shareBtn.textContent = lbl;
      }catch(e){ console.error(e); shareBtn.textContent = lbl; }
      shareBtn.disabled = false;
    });
  }

  // 結果カードを画像化（CTAボタンは隠して撮る）
  async function captureResult(){
    const wrap = document.querySelector('.r-wrap');
    const ctas = document.querySelector('.r-ctas');
    const prev = ctas ? ctas.style.display : '';
    if(ctas) ctas.style.display = 'none';
    let url;
    try{
      url = await window.htmlToImage.toPng(wrap, {
        pixelRatio: 2, skipFonts: true, backgroundColor: '#E7DCC4',
        style:{ paddingTop:'24px', paddingBottom:'24px' }
      });
    } finally {
      if(ctas) ctas.style.display = prev;
    }
    return url;
  }

  window.renderResult = renderResult;
  window.bindResult = bindResult;
})();

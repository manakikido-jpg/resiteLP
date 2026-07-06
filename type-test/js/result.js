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
    const lineUrl = TT.LINK.LINE_URL;                          // LINE友だち追加（相談導線）
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
            <p class="r-link-note">LINEで友だち追加後、このコードを送っていただくとスムーズです。</p>
          </div>

          <div class="r-ctas">
            <a class="r-cta r-cta-line" id="rLine" href="${lineUrl}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.626.626 0 0 1-.199.031c-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              この結果をふまえてLINEで相談する
            </a>
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

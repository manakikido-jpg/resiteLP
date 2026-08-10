function sopt(el) {
  document.querySelectorAll('#so .sf-opt').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('sn').classList.add('ok');
  sfPush('quick_check_answer', { quick_check_answer: (el.textContent || '').trim() });
}

// ===== QUICK CHECK の回答をGTMに送る =====
// 以前は回答がどこにも記録されず捨てられていた。画面の挙動は変えず、計測だけ載せる。
function sfPush(name, extra) {
  window.dataLayer = window.dataLayer || [];
  var q = document.querySelector('.sf-q');
  window.dataLayer.push(Object.assign({
    event: name,
    quick_check_question: q ? q.textContent.trim() : ''
  }, extra || {}));
}
// 「次へすすむ」：回答を送ってからLINEを開く
function sfNext() {
  var sel = document.querySelector('#so .sf-opt.sel');
  sfPush('quick_check_next', { quick_check_answer: sel ? sel.textContent.trim() : '(未選択)' });
  window.open('https://lin.ee/Q90TvNX', '_blank', 'noopener');
}

// ④ Scroll fade-in observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Header blur on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 80);
});

// Mobile CTA bar
const bar = document.getElementById('mcta');
if (bar) {
  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
      bar.style.transform = window.scrollY > 600 ? 'translateY(0)' : 'translateY(100%)';
    }
  });
}

// ===== Page loader controller =====
(function(){
  var ov = document.getElementById('plOverlay'); if(!ov) return;
  var pct = document.getElementById('plPct'), fill = document.getElementById('plFill');
  document.body.classList.add('pl-lock');
  var dur = 1200, start = null, done = false;
  function finish(){ if(done) return; done = true; ov.classList.add('pl-hide'); document.body.classList.remove('pl-lock'); setTimeout(function(){ if(ov && ov.parentNode){ ov.parentNode.removeChild(ov); } }, 800); }
  function frame(t){ if(start===null) start=t; var p=(t-start)/dur; if(p>1)p=1; var v=p<0.9?(p/0.9)*94:94+((p-0.9)/0.1)*6; pct.textContent=Math.round(v)+'%'; fill.style.width=v+'%'; if(p<1){ requestAnimationFrame(frame); } else { setTimeout(finish,320); } }
  requestAnimationFrame(frame);
  setTimeout(finish, 6000);
})();

// ===== Meta Pixel: LINE友だち追加クリックをLeadとして計測 =====
document.addEventListener('click', function (e) {
  var el = e.target.closest('a[href*="lin.ee"], [onclick*="lin.ee"]');
  if (el && typeof fbq === 'function') {
    fbq('track', 'Lead');
  }
}, true);

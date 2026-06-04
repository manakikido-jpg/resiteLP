/**
 * 診断アプリ本体（フロー制御 + DOM描画）
 *
 * 依存（先に読み込むこと）：
 *   questions.js   … QUESTIONS
 *   types.js       … TYPE_DEFINITIONS, AXIS_LABELS
 *   calculator.js  … DiagnosisCalculator
 *
 * 画面遷移： intro → questions → result
 * 純静的構成のため、すべてグローバル前提で動作する。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'kanousei_type_test_result';

  var state = {
    step: 'intro', // 'intro' | 'questions' | 'result'
    current: 0,
    answers: [], // Answer[]（index = 質問の並び）
    result: null,
  };

  var stage = document.getElementById('stage');
  var progressWrap = document.getElementById('progress');
  var progressFill = document.getElementById('progressFill');
  var progressCount = document.getElementById('progressCount');

  // ---- 小さなDOMヘルパー -------------------------------------------------
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') el.className = attrs[k];
        else if (k === 'text') el.textContent = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') {
          el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null) {
          el.setAttribute(k, attrs[k]);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function clearStage() {
    while (stage.firstChild) stage.removeChild(stage.firstChild);
  }

  // ---- プログレス --------------------------------------------------------
  function updateProgress() {
    if (state.step !== 'questions') {
      progressWrap.style.display = 'none';
      return;
    }
    progressWrap.style.display = 'block';
    var total = QUESTIONS.length;
    var cur = state.current + 1;
    progressFill.style.width = ((state.current) / total) * 100 + '%';
    progressCount.innerHTML =
      '<span class="cur">' + cur + '</span> / ' + total;
  }

  // ---- イントロ画面 ------------------------------------------------------
  function renderIntro() {
    state.step = 'intro';
    clearStage();
    updateProgress();

    var card = h('div', { class: 'intro' }, [
      h('div', { class: 'ey', text: 'CAREER TYPE DIAGNOSIS' }),
      h('h1', { class: 'intro-ttl' }, [
        '20の質問で、', h('br'), 'あなたの「働き方の本質」を診断',
      ]),
      h('p', { class: 'intro-lead', text:
        '4つの軸の組み合わせから、16タイプであなたの強みを言語化します。直感で選ぶだけ。所要時間は約3分です。' }),
      h('button', { class: 'btn btn-primary', onClick: startQuestions }, [
        '診断をはじめる',
        iconArrow(),
      ]),
      h('p', { class: 'intro-note', text: '※ 回答は送信されず、結果はこの端末内にのみ保存されます。' }),
    ]);
    stage.appendChild(card);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startQuestions() {
    state.step = 'questions';
    state.current = 0;
    state.answers = [];
    renderQuestion();
  }

  // ---- 質問画面 ----------------------------------------------------------
  function renderQuestion() {
    clearStage();
    updateProgress();
    var q = QUESTIONS[state.current];
    var existing = state.answers[state.current];

    var options = q.options.map(function (opt, idx) {
      var selected = existing &&
        existing.selectedAxis === opt.axis &&
        existing.selectedPole === opt.pole;
      return h('button', {
        class: 'option' + (selected ? ' is-selected' : ''),
        onClick: function () { selectOption(opt); },
      }, [
        h('span', { class: 'option-mark', text: String.fromCharCode(65 + idx) }),
        h('span', { class: 'option-text', text: opt.text }),
      ]);
    });

    var card = h('div', { class: 'q-card' }, [
      h('div', { class: 'q-no', text: 'Q' + (state.current + 1) }),
      h('h2', { class: 'q-text', text: q.text }),
      h('div', { class: 'options' }, options),
      state.current > 0
        ? h('button', { class: 'q-back', onClick: goBack }, ['← 前の質問にもどる'])
        : null,
    ]);
    stage.appendChild(card);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectOption(opt) {
    var q = QUESTIONS[state.current];
    state.answers[state.current] = {
      questionId: q.id,
      selectedAxis: opt.axis,
      selectedPole: opt.pole,
      weight: opt.weight,
    };
    if (state.current < QUESTIONS.length - 1) {
      state.current += 1;
      renderQuestion();
    } else {
      finish();
    }
  }

  function goBack() {
    if (state.current > 0) {
      state.current -= 1;
      renderQuestion();
    }
  }

  // ---- 集計 → 結果 -------------------------------------------------------
  function finish() {
    // タイムスタンプは呼び出し側で生成（仕様書のデータ永続化要件に準拠）
    var timestamp = new Date().toISOString();
    var answers = state.answers.slice();
    var result = DiagnosisCalculator.buildResult(answers, timestamp);
    state.result = result;
    saveResult(result);
    renderResult(result);
  }

  function saveResult(result) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (e) {
      // localStorage 不可（プライベートモード等）でも診断自体は継続
      console.warn('結果の保存に失敗しました:', e);
    }
  }

  // ---- 結果画面 ----------------------------------------------------------
  function renderResult(result) {
    state.step = 'result';
    clearStage();
    updateProgress();

    var type = TYPE_DEFINITIONS[result.personalityType];

    // タイプ ヘッダー
    var header = h('div', { class: 'r-head' }, [
      h('div', { class: 'r-emoji', text: type.emoji }),
      h('div', { class: 'r-code', text: result.personalityType }),
      h('h1', { class: 'r-name', text: type.name }),
      h('div', { class: 'r-name-en', text: type.nameEn }),
      h('p', { class: 'r-blurb', text: type.blurb }),
      h('div', { class: 'r-confidence' }, [
        '診断の確度 ',
        h('strong', { text: result.confidence + '%' }),
      ]),
    ]);

    // 軸スコア
    var bars = result.axisScores.map(function (s) {
      var lab = AXIS_LABELS[s.axis];
      var pct = Math.round(s.score);
      var leaning = pct >= 50 ? lab.pos : lab.neg;
      return h('div', { class: 'axis' }, [
        h('div', { class: 'axis-top' }, [
          h('span', { class: 'axis-title', text: lab.title }),
          h('span', { class: 'axis-leaning', text: leaning + '寄り（' + pct + '%）' }),
        ]),
        h('div', { class: 'axis-track' }, [
          h('div', { class: 'axis-fill', style: 'width:' + pct + '%' }),
          h('div', { class: 'axis-dot', style: 'left:' + pct + '%' }),
        ]),
        h('div', { class: 'axis-poles' }, [
          h('span', { text: lab.pos }),
          h('span', { text: lab.neg }),
        ]),
      ]);
    });

    var scoreBlock = h('div', { class: 'r-block' }, [
      h('div', { class: 'r-block-ttl', text: 'あなたの4つの軸' }),
      h('div', { class: 'axes' }, bars),
    ]);

    // 特徴
    var features = type.features.map(function (f) {
      return h('li', { class: 'feature' }, [
        h('strong', { class: 'feature-ttl', text: f.title }),
        h('p', { class: 'feature-desc', text: f.description }),
      ]);
    });
    var featureBlock = h('div', { class: 'r-block' }, [
      h('div', { class: 'r-block-ttl', text: 'このタイプの強み' }),
      h('ul', { class: 'features' }, features),
    ]);

    // アクション
    var actions = h('div', { class: 'r-actions' }, [
      h('button', { class: 'btn btn-ghost', onClick: function () { downloadJSON(result); } },
        ['結果をJSONで保存']),
      h('button', { class: 'btn btn-ghost', onClick: function (e) { copyJSON(result, e.currentTarget); } },
        ['結果をコピー']),
      h('button', { class: 'btn btn-line', onClick: renderIntro },
        ['もう一度診断する']),
    ]);

    // 相談導線（遷移先は運用に合わせて設定。未設定時は無効化して誤誘導を防ぐ）
    var cta = h('div', { class: 'r-cta' }, [
      h('p', { class: 'r-cta-lead', text: 'あなたの可能性を、一緒に言語化しませんか？' }),
      h('a', { class: 'btn btn-primary', href: '#', 'data-cta': 'consult' }, [
        '無料で相談してみる', iconArrow(),
      ]),
    ]);

    stage.appendChild(h('div', { class: 'result' }, [
      header, scoreBlock, featureBlock, actions, cta,
    ]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- 出力ユーティリティ ------------------------------------------------
  function downloadJSON(result) {
    var blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: 'type-test-result-' + result.personalityType + '.json' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyJSON(result, btn) {
    var text = JSON.stringify(result, null, 2);
    var done = function () {
      var orig = btn.textContent;
      btn.textContent = 'コピーしました';
      setTimeout(function () { btn.textContent = orig; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = h('textarea', { style: 'position:fixed;opacity:0;' });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function iconArrow() {
    var span = document.createElement('span');
    span.className = 'i-arrow';
    span.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    return span;
  }

  // ---- 起動 --------------------------------------------------------------
  renderIntro();
})();

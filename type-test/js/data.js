// ============================================================
// 可能性LABO 職業タイプ診断 v2 — データ & ロジック
// 4軸 × 2極 = 16タイプ / 20問 × 5段階
// ============================================================

// ----- 軸定義 -----
const AXES = [
  { key:'D', pos:'S', neg:'E', posLabel:'戦略', negLabel:'共感', posStat:'戦略性', negStat:'共感性' },
  { key:'W', pos:'T', neg:'L', posLabel:'チーム', negLabel:'個人', posStat:'協働力', negStat:'自走力' },
  { key:'J', pos:'O', neg:'I', posLabel:'論理', negLabel:'直感', posStat:'論理力', negStat:'直感力' },
  { key:'R', pos:'P', neg:'C', posLabel:'楽観', negLabel:'悲観', posStat:'楽観力', negStat:'慎重力' },
];

// ----- 20問 -----
const QUESTIONS = [
  { ax:'D', dir:+1, sec:'才能', text:'物事を始める前に「全体像」と「ゴール」を整理したくなる。' },
  { ax:'D', dir:+1, sec:'才能', text:'数字やデータを見ると、自然と意味やパターンを探してしまう。' },
  { ax:'D', dir:-1, sec:'才能', text:'相手の表情や声のトーンの変化に、すぐ気づくほうだ。' },
  { ax:'D', dir:-1, sec:'才能', text:'困っている人がいると、放っておけずに声をかけてしまう。' },
  { ax:'D', dir:+1, sec:'才能', text:'感情よりも「合理性」で判断するほうが心地よい。' },

  { ax:'W', dir:+1, sec:'働き方', text:'誰かと一緒に進めるほうが、ひとりで進めるより成果が出る。' },
  { ax:'W', dir:+1, sec:'働き方', text:'雑談やランチの時間が、仕事のエネルギーになる。' },
  { ax:'W', dir:-1, sec:'働き方', text:'ひとりで集中できる時間が、何より大切だ。' },
  { ax:'W', dir:-1, sec:'働き方', text:'会議やチーム作業が長く続くと、疲れがたまりやすい。' },
  { ax:'W', dir:+1, sec:'働き方', text:'人と話している中で、いいアイデアが生まれることが多い。' },

  { ax:'J', dir:+1, sec:'判断', text:'迷ったときは、メリット・デメリットを書き出して決める。' },
  { ax:'J', dir:+1, sec:'判断', text:'「なぜそうなるのか」を説明できないと、納得しにくい。' },
  { ax:'J', dir:-1, sec:'判断', text:'理屈より「なんとなくこっち」という感覚を信じることが多い。' },
  { ax:'J', dir:-1, sec:'判断', text:'初対面の人でも、第一印象でだいたい人物像がつかめる。' },
  { ax:'J', dir:+1, sec:'判断', text:'計画を立てると、その通りに進めたくなる。' },

  { ax:'R', dir:+1, sec:'構え', text:'新しい話を聞くと、まず「うまくいきそう」と感じることが多い。' },
  { ax:'R', dir:+1, sec:'構え', text:'失敗しても「なんとかなる」と気持ちを切り替えるのが早い。' },
  { ax:'R', dir:-1, sec:'構え', text:'物事を進めるとき、まず「リスク」や「抜け漏れ」が気になる。' },
  { ax:'R', dir:-1, sec:'構え', text:'「最悪の場合」を想定しておかないと、安心して動けない。' },
  { ax:'R', dir:+1, sec:'構え', text:'未来のことを考えると、不安よりワクワクのほうが大きい。' },
];

const SCALE = [
  { val:+2, label:'はい' },
  { val:+1, label:'どちらかといえば はい' },
  { val: 0, label:'どちらでもない' },
  { val:-1, label:'どちらかといえば いいえ' },
  { val:-2, label:'いいえ' },
];

// レア度ランク → 星
const RARITY = { UR:'★★★★★', SSR:'★★★★', SR:'★★★', R:'★★' };

// ----- 16タイプ定義（出現率は合計100.0%）-----
const TYPES = {
  STOP:{ code:'STOP', no:'01', name:'未来の指揮官', en:'The Commander', emoji:'♟',
    rank:'UR', pct:3.2, copy:'理想を、現実に変える人。',
    blurb:'論理でゴールを描き、楽観の力でチームを前へ動かすリーダー。',
    jobs:['経営者・起業家','事業開発','プロダクトマネージャー','戦略コンサルタント','新規事業リーダー'],
    strengths:[
      { title:'長期視点で逆算できる', body:'数年先のゴールから「いま何をすべきか」を導ける。' },
      { title:'迷っても決断で前に進める', body:'情報が揃わなくても旗を立て、チームを止めない。' },
      { title:'人を動かす言葉を持つ', body:'「なぜそこへ向かうか」を語り、自然と巻き込む。' },
    ],
    weaknesses:[
      { title:'先を急ぎすぎる', body:'周囲がついて来られないスピードで進めてしまうことも。' },
      { title:'細部を見落としやすい', body:'全体最適を優先し、現場の機微を取りこぼすことがある。' },
    ],
    good:'STOC', bad:'SLIC',
    grow:'あえて<b>「待つ」「任せる」</b>を意識すると、推進力が周囲の力を引き出す力に変わります。要所で<b>細部に強い参謀型</b>と組むと、理想がより確実に現実になります。' },

  STOC:{ code:'STOC', no:'02', name:'堅実な参謀', en:'The Tactician', emoji:'⌗',
    rank:'SSR', pct:5.6, copy:'勝ち筋を、静かに描く人。',
    blurb:'リスクを読み切り、論理で勝ち筋を組み立てるチームの司令塔。',
    jobs:['経営参謀','戦略コンサルタント','プロジェクトマネージャー','経営企画','アナリスト'],
    strengths:[
      { title:'勝ち筋とリスクを同時に見抜く', body:'成功シナリオと「どこで崩れるか」を両方描ける。' },
      { title:'冷静に計算して流されない', body:'場の熱量に引っ張られず、構造で判断できる。' },
      { title:'裏方としてチームを支える', body:'目立たずとも、組織が機能する設計を整える。' },
    ],
    weaknesses:[
      { title:'慎重さで機を逃すことがある', body:'確実性を求めるあまり、決断が遅れる場面も。' },
      { title:'自分の手柄を主張しなさすぎる', body:'貢献が見えにくく、正当に評価されにくい。' },
    ],
    good:'STOP', bad:'SLIP',
    grow:'<b>「7割で動く」</b>練習をすると、読みの鋭さが実行スピードと噛み合います。前に出る<b>リーダー型</b>に分析を渡すと、力が最大化します。' },

  STIP:{ code:'STIP', no:'03', name:'発想の伝道師', en:'The Visionary', emoji:'☄',
    rank:'SSR', pct:4.8, copy:'見えない未来を、語れる人。',
    blurb:'直感でビジョンを描き、明るい未来を語ってチームを巻き込む。',
    jobs:['新規事業','プロダクトマネージャー','クリエイティブディレクター','広報・エバンジェリスト','企画'],
    strengths:[
      { title:'まだ無い未来を言語化できる', body:'「こうなったら面白い」を人に伝わる形にできる。' },
      { title:'場を明るく前向きにする', body:'停滞した空気に光を入れ、推進力に変える。' },
      { title:'伝えること自体が得意', body:'考えを抱えず発信し、アイデアを広げられる。' },
    ],
    weaknesses:[
      { title:'詰めの実務が後回しになりがち', body:'構想は得意でも、地道な遂行で失速しやすい。' },
      { title:'熱量の波が出やすい', body:'乗っている時と冷める時の差が大きい。' },
    ],
    good:'STOC', bad:'ELOC',
    grow:'ひらめきを<b>「締切と数字」</b>に接続できる相棒を持つと、語った未来が形になります。' },

  STIC:{ code:'STIC', no:'04', name:'慎重な編集者', en:'The Editor', emoji:'❍',
    rank:'SR', pct:6.4, copy:'ひらめきを、形に変える人。',
    blurb:'直感のひらめきを、リスクごと編集して形に仕上げる頭脳。',
    jobs:['編集者','企画','ブランドディレクター','UXデザイナー','クリエイティブ'],
    strengths:[
      { title:'ひらめきをロジックに翻訳できる', body:'感覚的な案を「なぜ良いか」まで説明できる。' },
      { title:'抜け漏れや違和感を見逃さない', body:'俯瞰して弱点に先回りで気づける。' },
      { title:'素材を組み替えて形を整える', body:'転がるピースを編集し、完成形に近づける。' },
    ],
    weaknesses:[
      { title:'完璧を求めて抱え込みがち', body:'仕上げにこだわり、手放すのが遅くなる。' },
      { title:'慎重さでスピードが落ちる', body:'検討が長引き、機を逃すことがある。' },
    ],
    good:'STIP', bad:'ETOP',
    grow:'<b>「8割で出して直す」</b>を許すと、編集力が回転し始めます。発信力の強い相棒に届ける役を任せると映えます。' },

  SLOP:{ code:'SLOP', no:'05', name:'前向きな戦略家', en:'The Strategist', emoji:'◆',
    rank:'SSR', pct:5.2, copy:'ひとりで、道を切り拓く人。',
    blurb:'ひとりで深く考え、論理と楽観で道なき道を切り拓く。',
    jobs:['経営コンサルタント','投資・ファンド','起業家','事業戦略','アナリスト'],
    strengths:[
      { title:'ひとりの時間で深く考えられる', body:'静かな環境で思考の解像度が上がる。' },
      { title:'未知の領域に飛び込める', body:'前例がなくても楽観的に踏み出せる。' },
      { title:'誰も見ていない選択肢を選べる', body:'多数派でなく自分の頭で答えを取りに行く。' },
    ],
    weaknesses:[
      { title:'抱え込んで孤立しやすい', body:'ひとりで完結させ、周囲を置きがち。' },
      { title:'説明を省いて誤解されがち', body:'結論だけ伝え、意図が伝わらないことも。' },
    ],
    good:'ETOP', bad:'ELIC',
    grow:'考えた道筋を<b>「翻訳して共有」</b>する癖をつけると、孤独な戦略が組織の戦略になります。' },

  SLOC:{ code:'SLOC', no:'06', name:'静かな分析家', en:'The Analyst', emoji:'◇',
    rank:'SR', pct:7.0, copy:'事実から、答えを掘る人。',
    blurb:'リスクを直視し、データから誰も気づかない答えを見つける。',
    jobs:['データアナリスト','リサーチャー','エンジニア','研究職','品質管理'],
    strengths:[
      { title:'データと事実を何より重んじる', body:'印象でなく根拠を積み、精度高く結論を出す。' },
      { title:'ひとりで集中して成果を出す', body:'雑音から離れることが生産性そのもの。' },
      { title:'リスクや穴を慎重に拾う', body:'見落とされがちな落とし穴を先に指摘できる。' },
    ],
    weaknesses:[
      { title:'完璧主義で踏み出しが遅い', body:'確証を求め、行動が後ろ倒しになりがち。' },
      { title:'感情の機微を後回しにしがち', body:'正しさを優先し、人の気持ちを置くことも。' },
    ],
    good:'ETIP', bad:'STIP',
    grow:'<b>「結論を先に言う」</b>訓練をすると、深い分析が一気に伝わる武器になります。' },

  SLIP:{ code:'SLIP', no:'07', name:'独立の革新者', en:'The Innovator', emoji:'✦',
    rank:'UR', pct:3.6, copy:'自分の感覚で、未来を発明する人。',
    blurb:'自分の直感を信じ、楽しみながら未来を発明する一匹狼。',
    jobs:['起業家','フリーランス','クリエイター','プロダクト開発','発明・R&D'],
    strengths:[
      { title:'人と違う道を選ぶ迷いがない', body:'独自のポジションを自然に築ける。' },
      { title:'規則より自分の感覚を信じる', body:'前例にとらわれず、その場の最適を試せる。' },
      { title:'軽やかに試して学ぶ', body:'失敗を重く捉えず、試行回数で経験を貯める。' },
    ],
    weaknesses:[
      { title:'飽きっぽく一点に留まりにくい', body:'興味が移り、継続が課題になりやすい。' },
      { title:'協調より独走になりがち', body:'自分のペースが速く、周囲と段差が出る。' },
    ],
    good:'ETOC', bad:'STOC',
    grow:'<b>「仕組み化が得意な人」</b>を隣に置くと、発明が事業として根を張ります。' },

  SLIC:{ code:'SLIC', no:'08', name:'探究の哲学者', en:'The Philosopher', emoji:'❖',
    rank:'SR', pct:6.8, copy:'問いを、誰より深く掘る人。',
    blurb:'静かに本質を疑い、ひとつの問いを誰よりも深く掘る思索家。',
    jobs:['研究職','専門職・士業','作家・ライター','アーキテクト','大学・教育'],
    strengths:[
      { title:'ひとつの問いを考え抜ける', body:'深く長く考え、誰も到達しない場所まで掘る。' },
      { title:'本質や原理にこだわる', body:'「そもそも何か」を問い直すクセがある。' },
      { title:'世界から距離を取って深める', body:'静けさの中で思考の質を高められる。' },
    ],
    weaknesses:[
      { title:'動き出しが遅く機会を逃す', body:'納得を優先し、行動のタイミングを逃すことも。' },
      { title:'理屈が先で人と距離ができる', body:'探究に没入し、関係構築が後回しになりがち。' },
    ],
    good:'ETOP', bad:'STOP',
    grow:'<b>締切と発表の場</b>を決めると、深い思索が世に届く形になります。' },

  ETOP:{ code:'ETOP', no:'09', name:'共感の推進者', en:'The Catalyst', emoji:'✿',
    rank:'R', pct:8.4, copy:'人の心に、火をつける人。',
    blurb:'明るさと共感で人を動かす、チームの起爆剤。',
    jobs:['営業','広報・PR','コミュニティマネージャー','人事・採用','イベント企画'],
    strengths:[
      { title:'場の空気を明るく作り変える', body:'停滞した場面で、自然と温度を上げられる。' },
      { title:'人と人をつなぐ', body:'誰の強みも覚え、必要なときに引き合わせる。' },
      { title:'まず動いてみる', body:'考え込むより一歩出て、状況を変える。' },
    ],
    weaknesses:[
      { title:'感情に乗りすぎて消耗する', body:'人に入れ込み、自分が疲れてしまうことも。' },
      { title:'細部の詰めが甘くなりがち', body:'勢いで進み、抜けが出ることがある。' },
    ],
    good:'STOC', bad:'SLIC',
    grow:'熱量を<b>「記録と仕組み」</b>に残すと、一過性の盛り上がりが資産になります。' },

  ETOC:{ code:'ETOC', no:'10', name:'チームの調律師', en:'The Harmonizer', emoji:'❀',
    rank:'SR', pct:7.6, copy:'場を、静かに整える人。',
    blurb:'人と仕組みのバランスを慎重に整え、組織を静かに支える。',
    jobs:['人事・労務','マネージャー','カスタマーサクセス','組織開発','総務'],
    strengths:[
      { title:'人の微妙な変化に気づける', body:'「いつもと違う」を察し、安全な場をつくる。' },
      { title:'バランスをとるのが上手い', body:'対立を傷つけず調整し、橋渡しができる。' },
      { title:'裏方で支えるのを心地よく感じる', body:'組織が滑らかに動くことに喜びを感じる。' },
    ],
    weaknesses:[
      { title:'自分を後回しにしすぎる', body:'人を優先し、自分の要望を抑えてしまう。' },
      { title:'対立を避けて先送りしがち', body:'波風を立てまいと、判断を遅らせることも。' },
    ],
    good:'SLIP', bad:'SLOP',
    grow:'<b>「自分の意見も一つ置く」</b>を習慣にすると、調整役が信頼される推進役になります。' },

  ETIP:{ code:'ETIP', no:'11', name:'人を灯す案内人', en:'The Mentor', emoji:'☼',
    rank:'SR', pct:6.2, copy:'可能性を、見つけて照らす人。',
    blurb:'直感で可能性を見抜き、楽観の光で背中を押す案内人。',
    jobs:['コーチ','研修講師','キャリアアドバイザー','教師','カウンセラー'],
    strengths:[
      { title:'人の可能性を直感で見抜ける', body:'本人も気づかない強みを察知できる。' },
      { title:'言葉で背中を押せる', body:'必要なタイミングで必要な言葉をかけられる。' },
      { title:'のびやかに人を受け入れる', body:'否定せず受け止め、安心して話せる相手に。' },
    ],
    weaknesses:[
      { title:'相手に入れ込みすぎる', body:'親身になりすぎ、距離を保てないことも。' },
      { title:'自分の成長が後回しになりがち', body:'人の支援に注力し、自分を置きやすい。' },
    ],
    good:'SLOC', bad:'STOC',
    grow:'「教える」だけでなく<b>「自分も学ぶ」場</b>を持つと、灯す力がさらに広がります。' },

  ETIC:{ code:'ETIC', no:'12', name:'物語の紡ぎ手', en:'The Storyteller', emoji:'☽',
    rank:'SSR', pct:5.0, copy:'想いを、物語に変える人。',
    blurb:'チームの想いと痛みを物語に編み直し、世界に届ける。',
    jobs:['広報・PR','編集者','コピーライター','ブランドプランナー','映像・コンテンツ'],
    strengths:[
      { title:'人の感情を言葉にできる', body:'言語化できない想いを的確に翻訳できる。' },
      { title:'痛みにも目をそらさない', body:'葛藤に誠実に向き合うから、言葉が届く。' },
      { title:'物語として伝えるのが得意', body:'流れと余韻を持たせて心を動かせる。' },
    ],
    weaknesses:[
      { title:'感情を背負い込みやすい', body:'人の痛みを引き受け、消耗することも。' },
      { title:'締切より納得を優先しがち', body:'表現にこだわり、時間が読みにくい。' },
    ],
    good:'STIP', bad:'SLOC',
    grow:'<b>「伝える相手と目的」</b>を先に決めると、物語が成果につながります。' },

  ELOP:{ code:'ELOP', no:'13', name:'信頼の伴走者', en:'The Counselor', emoji:'✚',
    rank:'SR', pct:7.2, copy:'ひとりに、深く寄り添う人。',
    blurb:'一対一で寄り添い、論理と前向きさで道筋を示す相談役。',
    jobs:['キャリアカウンセラー','士業（社労士等）','専門相談員','コーチ','福祉専門職'],
    strengths:[
      { title:'一対一で深く向き合える', body:'短時間で深い信頼関係をつくれる。' },
      { title:'踏み込む静かな勇気がある', body:'触れにくいテーマにも敬意を持って入れる。' },
      { title:'受け止めつつ道筋を示せる', body:'共感で終わらず、次の一歩を一緒に描ける。' },
    ],
    weaknesses:[
      { title:'相手の重さを抱え込む', body:'親身さゆえ、自分が背負いすぎることも。' },
      { title:'大人数の場では消耗しやすい', body:'深く関わる分、広く浅くが苦手。' },
    ],
    good:'STIP', bad:'SLIP',
    grow:'<b>自分のケアの時間</b>を確保すると、伴走の質が長く保てます。' },

  ELOC:{ code:'ELOC', no:'14', name:'寄り添う実務家', en:'The Caretaker', emoji:'✤',
    rank:'R', pct:9.0, copy:'確かな仕事で、人を支える人。',
    blurb:'リスクを丁寧に拾い、目の前の人を確実に支える縁の下。',
    jobs:['医療事務','秘書・アシスタント','経理・バックオフィス','看護・介護','窓口・受付'],
    strengths:[
      { title:'細かいミスや変化を見逃さない', body:'小さな違和感を拾い、信頼を守る。' },
      { title:'地道な作業を継続できる', body:'毎日同じ品質で積み上げられる。' },
      { title:'人の不安を取り除く', body:'先回りでカバーし、安心の土台をつくる。' },
    ],
    weaknesses:[
      { title:'抱え込んで無理をしがち', body:'頼まれると断れず、負担をためやすい。' },
      { title:'変化や新しさが苦手', body:'慣れた手順から外れると不安が強まる。' },
    ],
    good:'STIP', bad:'SLIP',
    grow:'<b>「断る・頼る」</b>を覚えると、支える力が長続きします。' },

  ELIP:{ code:'ELIP', no:'15', name:'静かな共鳴者', en:'The Empath', emoji:'❁',
    rank:'SSR', pct:5.8, copy:'言葉にならない心に、触れる人。',
    blurb:'ひとりで人の心に触れ、希望のかけらをそっと差し出す。',
    jobs:['カウンセラー','セラピスト','作家・ライター','ケア職','アート・表現'],
    strengths:[
      { title:'言葉にならない感情を受け取れる', body:'繊細な共鳴で「分かってもらえた」を生む。' },
      { title:'澄んだ時間を必要とする', body:'自分を整えるリズムが力の源になる。' },
      { title:'希望を見いだすのが得意', body:'暗い状況でも小さな光に気づける。' },
    ],
    weaknesses:[
      { title:'人の感情に影響されすぎる', body:'周囲の気分を受けすぎ、揺れやすい。' },
      { title:'自分を表に出すのが苦手', body:'内に持ち、発信や主張を控えがち。' },
    ],
    good:'ETOP', bad:'STOP',
    grow:'感じたことを<b>「作品や言葉に出す」場</b>を持つと、繊細さが才能に変わります。' },

  ELIC:{ code:'ELIC', no:'16', name:'手仕事の癒し手', en:'The Artisan', emoji:'❃',
    rank:'R', pct:8.2, copy:'丁寧な手で、誰かを癒す人。',
    blurb:'静かな手仕事で、誰かの痛みを丁寧に解きほぐすひと。',
    jobs:['クリエイター・作家','治療家（鍼灸等）','職人','トリマー・美容','ものづくり'],
    strengths:[
      { title:'丁寧さを何よりも重んじる', body:'一つひとつの仕上がりに信頼が宿る。' },
      { title:'手の感覚を信じる', body:'言葉になる前の手応えで品質を担保する。' },
      { title:'静けさの中で集中できる', body:'没入の時間が最高の成果を生む。' },
    ],
    weaknesses:[
      { title:'マイペースで納期と衝突しがち', body:'こだわりが、締切と噛み合わないことも。' },
      { title:'自己アピールが苦手', body:'良い仕事が、周囲に伝わりにくい。' },
    ],
    good:'ETIP', bad:'SLOP',
    grow:'作ったものを<b>「見せる・届ける」</b>一歩を足すと、手仕事が仕事として育ちます。' },
};

// ----- スコアリング -----
function scoreAnswers(answers){
  const score = { D:0, W:0, J:0, R:0 };
  QUESTIONS.forEach((q,i)=>{ score[q.ax] += (answers[i] ?? 0) * q.dir; });
  const code =
    (score.D>=0?'S':'E') + (score.W>=0?'T':'L') +
    (score.J>=0?'O':'I') + (score.R>=0?'P':'C');
  return { code, scores:score, type:TYPES[code] };
}

// 各軸を 0..100（pos寄りで高い）
function axisPercent(score, axisKey){
  const max = 10;
  return Math.round(((score[axisKey] + max) / (2*max)) * 100);
}

// ステータス表示用：本人の寄っている極の名前 + 強さ(50..100)
function statProfile(scores){
  return AXES.map(ax=>{
    const v = scores[ax.key];           // -10..+10
    const pos = v >= 0;
    const strength = Math.round(50 + (Math.abs(v)/10)*45); // 50..95
    return { name: pos ? ax.posStat : ax.negStat, value: strength, pole: pos?ax.posLabel:ax.negLabel };
  });
}

// ============================================================
// 連携（候補者プロファイル / 面談予約システムとの contract）
//   仕様: uploads/INTEGRATION.md §2
//   各軸スコア(−10〜+10) を1文字に符号化し、軸順 才能→働き方→判断→構え で連結した4文字コード
// ============================================================
const CODE_CHARS = '0123456789ABCDEFGHIJK';   // index 0..20  ( score = index - 10 )
const CODE_AXES  = ['D','W','J','R'];          // 才能 → 働き方 → 判断 → 構え（タイプコードと同桁順）

function scoreToChar(score){
  const i = Math.max(0, Math.min(20, Math.round(score) + 10));
  return CODE_CHARS[i];
}
function charToScore(ch){
  const i = CODE_CHARS.indexOf(ch);
  return i < 0 ? null : i - 10;
}
// scores{D,W,J,R} → "XXXX"
function encodeCode(scores){
  return CODE_AXES.map(k => scoreToChar(scores[k] ?? 0)).join('');
}
// "XXXX" → scores{D,W,J,R} or null（無効コード時）
function codeToScores(code){
  if(typeof code !== 'string') return null;
  const c = code.trim().toUpperCase();
  if(!/^[0-9A-K]{4}$/.test(c)) return null;
  const out = {};
  for(let i=0;i<4;i++){ out[CODE_AXES[i]] = charToScore(c[i]); }
  return out;
}
// scores → 4文字タイプコード（プロファイル側の復元と同一閾値）
function scoresToTypeCode(scores){
  return (scores.D>=0?'S':'E') + (scores.W>=0?'T':'L') +
         (scores.J>=0?'O':'I') + (scores.R>=0?'P':'C');
}

// 面談予約ページの本番URL（INTEGRATION.md §6）。デプロイ時に書き換える。
const LINK = { BOOKING_URL: '/booking.html', LINE_URL: 'https://lin.ee/Q90TvNX' };

window.TYPETEST = { AXES, QUESTIONS, SCALE, RARITY, TYPES, scoreAnswers, axisPercent, statProfile,
  CODE_CHARS, encodeCode, codeToScores, scoreToChar, charToScore, scoresToTypeCode, LINK };

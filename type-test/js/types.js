/**
 * 16タイプの詳細定義
 *
 * タイプコードは4文字： [E|A][T|L][O|I][P|C]
 *   1文字目  E=共感   / A=非共感(課題志向)
 *   2文字目  T=チーム / L=個人
 *   3文字目  O=論理   / I=直感
 *   4文字目  P=楽観   / C=慎重
 *
 * 各タイプ： name(和名) / nameEn / emoji / blurb / features[3]
 * グローバル変数 TYPE_DEFINITIONS として公開。
 */
const TYPE_DEFINITIONS = {
  // ---- E（共感）×T（チーム） ----
  ETOP: {
    name: '組織の触媒', nameEn: 'The Catalyst', emoji: '⚡',
    blurb: '人の気持ちを理解しながら、論理と前向きさでチームを動かす起爆剤。',
    features: [
      { title: '人のやる気に火をつける', description: '相手の感情を汲み取り、納得感のある言葉で周囲を巻き込んでいく。' },
      { title: '筋の通った推進力', description: '勢いだけで終わらせず、根拠を示してチームを前へ進める。' },
      { title: '可能性から考える', description: '困難な状況でも「できる前提」で道を探し、場を明るくする。' },
    ],
  },
  ETOC: {
    name: '信頼の設計者', nameEn: 'The Architect of Trust', emoji: '🏛',
    blurb: '人に寄り添いつつ、慎重に筋道を立ててチームの土台を築く人。',
    features: [
      { title: 'チームの安心をつくる', description: 'メンバーの気持ちに配慮しながら、崩れない仕組みを設計する。' },
      { title: 'リスクを先読みする', description: '楽観に流されず、起こりうる問題に備えて段取りを組む。' },
      { title: '論理で納得を生む', description: '感情と理屈の両面から、関係者が腑に落ちる合意を導く。' },
    ],
  },
  ETIP: {
    name: '場を温める火', nameEn: 'The Energizer', emoji: '🔥',
    blurb: '直感的に人の心をつかみ、チームの空気を明るくするムードメーカー。',
    features: [
      { title: '空気を読む天才', description: '言葉にならない感情を察し、場の温度を一瞬で変える。' },
      { title: '巻き込む熱量', description: '前向きなエネルギーで、周囲を自然と動かしていく。' },
      { title: 'ひらめきで動く', description: '理屈より先に直感で動き、停滞したチームに勢いを与える。' },
    ],
  },
  ETIC: {
    name: '縁の下の調停者', nameEn: 'The Mediator', emoji: '🤝',
    blurb: '感受性豊かに人と人をつなぎ、慎重に調和を保つ橋渡し役。',
    features: [
      { title: '対立を和らげる', description: '双方の気持ちを汲み取り、こじれた関係を静かにほどく。' },
      { title: '細やかな気づき', description: '小さな違和感を見逃さず、問題が大きくなる前に手当てする。' },
      { title: '信頼を積み重ねる', description: '派手さはないが、丁寧な対応でチームの結束を支える。' },
    ],
  },

  // ---- E（共感）×L（個人） ----
  ELOP: {
    name: '一途な伴走者', nameEn: 'The Companion', emoji: '🌱',
    blurb: '一対一で深く寄り添い、論理的に相手の可能性を広げる人。',
    features: [
      { title: '深く向き合う', description: '広く浅くではなく、目の前の一人にとことん寄り添う。' },
      { title: '可能性を言語化する', description: '相手の強みを論理立てて整理し、次の一歩を照らす。' },
      { title: '前向きに支える', description: 'できない理由より、できる方法を一緒に探す。' },
    ],
  },
  ELOC: {
    name: '静かな分析家', nameEn: 'The Quiet Analyst', emoji: '📘',
    blurb: '一人で深く考え、人の機微を論理で支える思慮深い人。',
    features: [
      { title: '観察と洞察', description: '一歩引いた位置から人や状況を冷静に読み解く。' },
      { title: '慎重な判断', description: '感情に流されず、リスクを見極めてから動く。' },
      { title: '芯のある優しさ', description: '言葉は多くないが、要所で相手を的確に支える。' },
    ],
  },
  ELIP: {
    name: '自由な表現者', nameEn: 'The Creator', emoji: '🎨',
    blurb: '感性で人の心を動かす、独立心のある創り手。',
    features: [
      { title: '感性で伝える', description: '理屈を超えたイメージや表現で、人の心に届ける。' },
      { title: '自分の世界を持つ', description: '一人の時間で構想を練り、独自の価値を生み出す。' },
      { title: '可能性に賭ける', description: '前例がなくても「面白そう」を信じて踏み出す。' },
    ],
  },
  ELIC: {
    name: '内省する職人', nameEn: 'The Craftsman', emoji: '🪡',
    blurb: '直感と慎重さで、一人静かに質を磨き上げる人。',
    features: [
      { title: '細部へのこだわり', description: '直感で違和感を捉え、納得いくまで丁寧に仕上げる。' },
      { title: '一人で深める', description: '静かな集中の中で、自分の感覚を確かなものにしていく。' },
      { title: '人知れず支える', description: '目立たずとも、その仕事の質が周囲の信頼を生む。' },
    ],
  },

  // ---- A（課題志向）×T（チーム） ----
  ATOP: {
    name: '推進するリーダー', nameEn: 'The Driver', emoji: '🚀',
    blurb: '成果に向けて、論理と勢いでチームを牽引する推進役。',
    features: [
      { title: 'ゴールから逆算', description: '目指す成果を明確にし、最短ルートでチームを導く。' },
      { title: '決断が速い', description: '迷う場面でも前向きに決め、停滞をつくらない。' },
      { title: '巻き込んで動かす', description: '一人で抱えず、チームの力を結集して結果を出す。' },
    ],
  },
  ATOC: {
    name: '堅実な指揮官', nameEn: 'The Strategist', emoji: '♟',
    blurb: 'リスクを見極めながら、チームを着実に勝たせる戦略家。',
    features: [
      { title: '先を読む戦略', description: '複数の展開を想定し、勝ち筋を冷静に組み立てる。' },
      { title: '堅実なマネジメント', description: '感情より成果を軸に、ぶれないかじ取りをする。' },
      { title: '備えを怠らない', description: '最悪を想定した準備で、チームを失敗から守る。' },
    ],
  },
  ATIP: {
    name: '切り拓く開拓者', nameEn: 'The Pioneer', emoji: '🧭',
    blurb: '直感で機会をつかみ、チームを新天地へ導く開拓者。',
    features: [
      { title: 'チャンスを嗅ぎ分ける', description: 'データより先に、直感で勝負どころを見抜く。' },
      { title: '前へ進む推進力', description: '未知の状況でも「やってみよう」とチームを動かす。' },
      { title: '変化を楽しむ', description: '不確実さを恐れず、新しい挑戦を成果に変える。' },
    ],
  },
  ATIC: {
    name: '鋭い参謀', nameEn: 'The Tactician', emoji: '🎯',
    blurb: '直感的に本質を捉え、慎重にチームを導く参謀役。',
    features: [
      { title: '本質を見抜く', description: '複雑な状況でも、勘所を素早く掴んで核心を突く。' },
      { title: '慎重な打ち手', description: 'ひらめきを鵜呑みにせず、確かめてから手を打つ。' },
      { title: '裏方の切れ味', description: '前に立つより、要所で効く一手でチームを勝たせる。' },
    ],
  },

  // ---- A（課題志向）×L（個人） ----
  ALOP: {
    name: '独立の挑戦者', nameEn: 'The Challenger', emoji: '🏹',
    blurb: '自分の裁量で、論理的に可能性へ挑む一匹狼。',
    features: [
      { title: '自走できる', description: '指示を待たず、自分で考えて成果まで走り切る。' },
      { title: '論理的な突破', description: '感覚ではなく筋道で、課題を一つずつ崩していく。' },
      { title: '高い目標を楽しむ', description: '難しいほど燃え、可能性に向かって挑み続ける。' },
    ],
  },
  ALOC: {
    name: '完遂する専門家', nameEn: 'The Specialist', emoji: '🔬',
    blurb: '一人で精緻に、確実にやり遂げるプロフェッショナル。',
    features: [
      { title: '緻密な仕事', description: '論理と正確さを武器に、抜けのない成果を出す。' },
      { title: '一人で完結させる', description: '自分の領域を深く掘り下げ、最後まで責任を持つ。' },
      { title: 'リスクに強い', description: '慎重な確認で、ミスや破綻を未然に防ぐ。' },
    ],
  },
  ALIP: {
    name: '身軽な革新者', nameEn: 'The Innovator', emoji: '💡',
    blurb: '直感と行動力で、独自の道を切り拓くイノベーター。',
    features: [
      { title: 'まず動いて試す', description: '考え込むより先に手を動かし、可能性を確かめる。' },
      { title: '独創的な発想', description: '直感から生まれるアイデアで、前例のない解を出す。' },
      { title: '身軽な挑戦', description: '一人で素早く動き、変化をチャンスに変える。' },
    ],
  },
  ALIC: {
    name: '孤高の研ぎ手', nameEn: 'The Perfectionist', emoji: '🗡',
    blurb: '直感を慎重に磨き上げ、一人で極めるストイックな人。',
    features: [
      { title: '妥協しない', description: '自分の基準を持ち、納得いくまで質を追い込む。' },
      { title: '直感を裏づける', description: 'ひらめきを慎重に検証し、確かな成果に仕上げる。' },
      { title: '静かな集中力', description: '一人の世界で深く没頭し、唯一無二の仕事を生む。' },
    ],
  },
};

// 各軸のラベル（結果表示で使用）
const AXIS_LABELS = {
  'E':   { key: 'E',   pos: '共感',   neg: '非共感', posCode: 'E', negCode: 'A', title: '対人スタンス' },
  'T/L': { key: 'T/L', pos: 'チーム', neg: '個人',   posCode: 'T', negCode: 'L', title: '動き方' },
  'O/I': { key: 'O/I', pos: '論理',   neg: '直感',   posCode: 'O', negCode: 'I', title: '判断軸' },
  'P/C': { key: 'P/C', pos: '楽観',   neg: '慎重',   posCode: 'P', negCode: 'C', title: '見通し' },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TYPE_DEFINITIONS, AXIS_LABELS };
}

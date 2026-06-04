/**
 * 質問セットの定義（全20問 / 4軸 × 5問）
 *
 * 各 option は { text, axis, pole, weight } を持つ。
 *   axis : 'E' | 'T/L' | 'O/I' | 'P/C'
 *   pole : 'pos'（ポジティブ極） | 'neg'（ネガティブ極）
 *     E軸   pos=共感(E)   / neg=非共感(A)
 *     T/L軸 pos=チーム(T) / neg=個人(L)
 *     O/I軸 pos=論理(O)   / neg=直感(I)
 *     P/C軸 pos=楽観(P)   / neg=慎重(C)
 *   weight : 重み（通常 1）
 *
 * グローバル変数 QUESTIONS として公開（ビルドなしの純静的構成）。
 */
const QUESTIONS = [
  // ===== E軸：共感（E） / 非共感・課題志向（A） =====
  {
    id: 1,
    text: '同僚が締め切りに追われて余裕がなさそう。あなたはまず？',
    options: [
      { text: '「大丈夫？」と気持ちを気にかける', axis: 'E', pole: 'pos', weight: 1 },
      { text: '手分けして片づける段取りを考える', axis: 'E', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 2,
    text: '会議で誰かの意見が却下されて落ち込んでいる。あなたは？',
    options: [
      { text: 'あとでそっとフォローの声をかける', axis: 'E', pole: 'pos', weight: 1 },
      { text: '議題を前に進めることを優先する', axis: 'E', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 3,
    text: '後輩が小さなミスを引きずっている。どう関わる？',
    options: [
      { text: '気持ちが軽くなるまで寄り添う', axis: 'E', pole: 'pos', weight: 1 },
      { text: '再発防止の具体策を一緒に決める', axis: 'E', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 4,
    text: '人の話を聞くとき、自然と意識が向くのは？',
    options: [
      { text: '言葉の裏にある感情', axis: 'E', pole: 'pos', weight: 1 },
      { text: '話の要点と結論', axis: 'E', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 5,
    text: 'チームの雰囲気が悪いと感じたとき、気になるのは？',
    options: [
      { text: '一人ひとりの心情', axis: 'E', pole: 'pos', weight: 1 },
      { text: '何が問題なのかという原因', axis: 'E', pole: 'neg', weight: 1 },
    ],
  },

  // ===== T/L軸：チーム志向（T） / 個人志向（L） =====
  {
    id: 6,
    text: '大きな成果を出すなら、近いのは？',
    options: [
      { text: '仲間と力を合わせて挑む', axis: 'T/L', pole: 'pos', weight: 1 },
      { text: '自分の裁量で集中して取り組む', axis: 'T/L', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 7,
    text: '新しいことを学ぶとき、心地よいのは？',
    options: [
      { text: '誰かと教え合いながら進める', axis: 'T/L', pole: 'pos', weight: 1 },
      { text: '自分のペースで一人で進める', axis: 'T/L', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 8,
    text: '理想の働き方に近いのは？',
    options: [
      { text: '活発に連携し合うチーム', axis: 'T/L', pole: 'pos', weight: 1 },
      { text: '任されて没頭できる環境', axis: 'T/L', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 9,
    text: '良いアイデアが浮かんだとき、まず？',
    options: [
      { text: 'すぐ周りと共有して広げる', axis: 'T/L', pole: 'pos', weight: 1 },
      { text: 'まず自分で形にしてみる', axis: 'T/L', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 10,
    text: 'モチベーションが上がるのは？',
    options: [
      { text: '仲間の期待や一体感', axis: 'T/L', pole: 'pos', weight: 1 },
      { text: '自分のこだわりや達成感', axis: 'T/L', pole: 'neg', weight: 1 },
    ],
  },

  // ===== O/I軸：論理（O） / 直感（I） =====
  {
    id: 11,
    text: '重要な判断をするとき、頼りにするのは？',
    options: [
      { text: '根拠やデータ', axis: 'O/I', pole: 'pos', weight: 1 },
      { text: '直感や手ごたえ', axis: 'O/I', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 12,
    text: '計画を立てるとき、近いのは？',
    options: [
      { text: '筋道を立てて順に整理する', axis: 'O/I', pole: 'pos', weight: 1 },
      { text: '全体像を感覚でつかむ', axis: 'O/I', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 13,
    text: '初めての課題に向き合うと、まず？',
    options: [
      { text: '情報を集めて分析する', axis: 'O/I', pole: 'pos', weight: 1 },
      { text: 'とりあえずやってみて掴む', axis: 'O/I', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 14,
    text: '人に何かを説明するとき、得意なのは？',
    options: [
      { text: '順序立てて論理的に伝える', axis: 'O/I', pole: 'pos', weight: 1 },
      { text: 'イメージや例えで伝える', axis: 'O/I', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 15,
    text: '選択に迷ったとき、決め手にするのは？',
    options: [
      { text: 'メリット・デメリットの比較', axis: 'O/I', pole: 'pos', weight: 1 },
      { text: 'しっくりくる方の感覚', axis: 'O/I', pole: 'neg', weight: 1 },
    ],
  },

  // ===== P/C軸：楽観（P） / 慎重（C） =====
  {
    id: 16,
    text: '新しい挑戦を前にすると、近いのは？',
    options: [
      { text: 'わくわくして可能性を見る', axis: 'P/C', pole: 'pos', weight: 1 },
      { text: 'まずリスクを見極めたくなる', axis: 'P/C', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 17,
    text: '物事の見通しを立てるとき？',
    options: [
      { text: 'うまくいく前提で動き出す', axis: 'P/C', pole: 'pos', weight: 1 },
      { text: '最悪の場合に備えておく', axis: 'P/C', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 18,
    text: '失敗してしまったとき、近いのは？',
    options: [
      { text: '次に活かせると切り替える', axis: 'P/C', pole: 'pos', weight: 1 },
      { text: '原因を徹底的に洗い出す', axis: 'P/C', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 19,
    text: '先の読めない状況に置かれたら？',
    options: [
      { text: '「なんとかなる」と進む', axis: 'P/C', pole: 'pos', weight: 1 },
      { text: '慎重に確認してから進む', axis: 'P/C', pole: 'neg', weight: 1 },
    ],
  },
  {
    id: 20,
    text: 'チームに足りないと感じやすいのは？',
    options: [
      { text: 'もっと前向きさが欲しい', axis: 'P/C', pole: 'pos', weight: 1 },
      { text: 'もっと注意深さが欲しい', axis: 'P/C', pole: 'neg', weight: 1 },
    ],
  },
];

// 純静的構成のためグローバル公開（モジュール環境なら export も許容）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS };
}

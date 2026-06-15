/* =========================================================
   16タイプ定義 — 正本: 職業タイプ診断 v2（design_handoff_career_type_test / data.js）
   タイプコード: [S|E][T|L][O|I][P|C]
     1文字目  S=戦略 / E=共感（才能の方向）
     2文字目  T=チーム / L=個人（働き方）
     3文字目  O=論理 / I=直感（意思決定）
     4文字目  P=楽観 / C=悲観（構え）
   ※ name / en / blurb / feats(=strengths 3点) は type-test/js/data.js の TYPES と同一内容（二重管理）。
   ========================================================= */

export interface TypeFeature {
  title: string;
  description: string;
}

export interface TypeDef {
  name: string;
  en: string;
  blurb: string;
  feats: TypeFeature[];
}

export const TYPES: Record<string, TypeDef> = {
  STOP: { name: "未来の指揮官", en: "The Commander", blurb: "論理でゴールを描き、楽観の力でチームを前へ動かすリーダー。",
    feats: [
      { title: "長期視点で逆算できる", description: "数年先のゴールから「いま何をすべきか」を導ける。" },
      { title: "迷っても決断で前に進める", description: "情報が揃わなくても旗を立て、チームを止めない。" },
      { title: "人を動かす言葉を持つ", description: "「なぜそこへ向かうか」を語り、自然と巻き込む。" },
    ] },
  STOC: { name: "堅実な参謀", en: "The Tactician", blurb: "リスクを読み切り、論理で勝ち筋を組み立てるチームの司令塔。",
    feats: [
      { title: "勝ち筋とリスクを同時に見抜く", description: "成功シナリオと「どこで崩れるか」を両方描ける。" },
      { title: "冷静に計算して流されない", description: "場の熱量に引っ張られず、構造で判断できる。" },
      { title: "裏方としてチームを支える", description: "目立たずとも、組織が機能する設計を整える。" },
    ] },
  STIP: { name: "発想の伝道師", en: "The Visionary", blurb: "直感でビジョンを描き、明るい未来を語ってチームを巻き込む。",
    feats: [
      { title: "まだ無い未来を言語化できる", description: "「こうなったら面白い」を人に伝わる形にできる。" },
      { title: "場を明るく前向きにする", description: "停滞した空気に光を入れ、推進力に変える。" },
      { title: "伝えること自体が得意", description: "考えを抱えず発信し、アイデアを広げられる。" },
    ] },
  STIC: { name: "慎重な編集者", en: "The Editor", blurb: "直感のひらめきを、リスクごと編集して形に仕上げる頭脳。",
    feats: [
      { title: "ひらめきをロジックに翻訳できる", description: "感覚的な案を「なぜ良いか」まで説明できる。" },
      { title: "抜け漏れや違和感を見逃さない", description: "俯瞰して弱点に先回りで気づける。" },
      { title: "素材を組み替えて形を整える", description: "転がるピースを編集し、完成形に近づける。" },
    ] },
  SLOP: { name: "前向きな戦略家", en: "The Strategist", blurb: "ひとりで深く考え、論理と楽観で道なき道を切り拓く。",
    feats: [
      { title: "ひとりの時間で深く考えられる", description: "静かな環境で思考の解像度が上がる。" },
      { title: "未知の領域に飛び込める", description: "前例がなくても楽観的に踏み出せる。" },
      { title: "誰も見ていない選択肢を選べる", description: "多数派でなく自分の頭で答えを取りに行く。" },
    ] },
  SLOC: { name: "静かな分析家", en: "The Analyst", blurb: "リスクを直視し、データから誰も気づかない答えを見つける。",
    feats: [
      { title: "データと事実を何より重んじる", description: "印象でなく根拠を積み、精度高く結論を出す。" },
      { title: "ひとりで集中して成果を出す", description: "雑音から離れることが生産性そのもの。" },
      { title: "リスクや穴を慎重に拾う", description: "見落とされがちな落とし穴を先に指摘できる。" },
    ] },
  SLIP: { name: "独立の革新者", en: "The Innovator", blurb: "自分の直感を信じ、楽しみながら未来を発明する一匹狼。",
    feats: [
      { title: "人と違う道を選ぶ迷いがない", description: "独自のポジションを自然に築ける。" },
      { title: "規則より自分の感覚を信じる", description: "前例にとらわれず、その場の最適を試せる。" },
      { title: "軽やかに試して学ぶ", description: "失敗を重く捉えず、試行回数で経験を貯める。" },
    ] },
  SLIC: { name: "探究の哲学者", en: "The Philosopher", blurb: "静かに本質を疑い、ひとつの問いを誰よりも深く掘る思索家。",
    feats: [
      { title: "ひとつの問いを考え抜ける", description: "深く長く考え、誰も到達しない場所まで掘る。" },
      { title: "本質や原理にこだわる", description: "「そもそも何か」を問い直すクセがある。" },
      { title: "世界から距離を取って深める", description: "静けさの中で思考の質を高められる。" },
    ] },
  ETOP: { name: "共感の推進者", en: "The Catalyst", blurb: "明るさと共感で人を動かす、チームの起爆剤。",
    feats: [
      { title: "場の空気を明るく作り変える", description: "停滞した場面で、自然と温度を上げられる。" },
      { title: "人と人をつなぐ", description: "誰の強みも覚え、必要なときに引き合わせる。" },
      { title: "まず動いてみる", description: "考え込むより一歩出て、状況を変える。" },
    ] },
  ETOC: { name: "チームの調律師", en: "The Harmonizer", blurb: "人と仕組みのバランスを慎重に整え、組織を静かに支える。",
    feats: [
      { title: "人の微妙な変化に気づける", description: "「いつもと違う」を察し、安全な場をつくる。" },
      { title: "バランスをとるのが上手い", description: "対立を傷つけず調整し、橋渡しができる。" },
      { title: "裏方で支えるのを心地よく感じる", description: "組織が滑らかに動くことに喜びを感じる。" },
    ] },
  ETIP: { name: "人を灯す案内人", en: "The Mentor", blurb: "直感で可能性を見抜き、楽観の光で背中を押す案内人。",
    feats: [
      { title: "人の可能性を直感で見抜ける", description: "本人も気づかない強みを察知できる。" },
      { title: "言葉で背中を押せる", description: "必要なタイミングで必要な言葉をかけられる。" },
      { title: "のびやかに人を受け入れる", description: "否定せず受け止め、安心して話せる相手に。" },
    ] },
  ETIC: { name: "物語の紡ぎ手", en: "The Storyteller", blurb: "チームの想いと痛みを物語に編み直し、世界に届ける。",
    feats: [
      { title: "人の感情を言葉にできる", description: "言語化できない想いを的確に翻訳できる。" },
      { title: "痛みにも目をそらさない", description: "葛藤に誠実に向き合うから、言葉が届く。" },
      { title: "物語として伝えるのが得意", description: "流れと余韻を持たせて心を動かせる。" },
    ] },
  ELOP: { name: "信頼の伴走者", en: "The Counselor", blurb: "一対一で寄り添い、論理と前向きさで道筋を示す相談役。",
    feats: [
      { title: "一対一で深く向き合える", description: "短時間で深い信頼関係をつくれる。" },
      { title: "踏み込む静かな勇気がある", description: "触れにくいテーマにも敬意を持って入れる。" },
      { title: "受け止めつつ道筋を示せる", description: "共感で終わらず、次の一歩を一緒に描ける。" },
    ] },
  ELOC: { name: "寄り添う実務家", en: "The Caretaker", blurb: "リスクを丁寧に拾い、目の前の人を確実に支える縁の下。",
    feats: [
      { title: "細かいミスや変化を見逃さない", description: "小さな違和感を拾い、信頼を守る。" },
      { title: "地道な作業を継続できる", description: "毎日同じ品質で積み上げられる。" },
      { title: "人の不安を取り除く", description: "先回りでカバーし、安心の土台をつくる。" },
    ] },
  ELIP: { name: "静かな共鳴者", en: "The Empath", blurb: "ひとりで人の心に触れ、希望のかけらをそっと差し出す。",
    feats: [
      { title: "言葉にならない感情を受け取れる", description: "繊細な共鳴で「分かってもらえた」を生む。" },
      { title: "澄んだ時間を必要とする", description: "自分を整えるリズムが力の源になる。" },
      { title: "希望を見いだすのが得意", description: "暗い状況でも小さな光に気づける。" },
    ] },
  ELIC: { name: "手仕事の癒し手", en: "The Artisan", blurb: "静かな手仕事で、誰かの痛みを丁寧に解きほぐすひと。",
    feats: [
      { title: "丁寧さを何よりも重んじる", description: "一つひとつの仕上がりに信頼が宿る。" },
      { title: "手の感覚を信じる", description: "言葉になる前の手応えで品質を担保する。" },
      { title: "静けさの中で集中できる", description: "没入の時間が最高の成果を生む。" },
    ] },
};

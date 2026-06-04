/**
 * 診断計算エンジン
 *
 * 仕様書の DiagnosisCalculator をバニラJSへ移植したもの。
 *   - calculateAxisScores : 回答 → 軸別スコア(0-100)
 *   - determineType       : 軸スコア → 16タイプのコード
 *   - calculateConfidence : 各軸の振れ幅 → 確度(0-100)
 *
 * 軸の並び順は 'E' → 'T/L' → 'O/I' → 'P/C' で固定（タイプコードの桁順と一致）。
 */
const AXES = ['E', 'T/L', 'O/I', 'P/C'];

const DiagnosisCalculator = {
  /**
   * 回答配列から軸別スコアを算出する。
   * @param {Array<{questionId:number, selectedAxis:string, selectedPole:'pos'|'neg', weight:number}>} answers
   * @returns {Array<{axis:string, positivePoints:number, totalPoints:number, score:number}>}
   */
  calculateAxisScores(answers) {
    return AXES.map((axis) => {
      const axisAnswers = answers.filter((a) => a.selectedAxis === axis);
      const positivePoints = axisAnswers
        .filter((a) => a.selectedPole === 'pos')
        .reduce((sum, a) => sum + a.weight, 0);
      const totalPoints = axisAnswers.reduce((sum, a) => sum + a.weight, 0);
      // 0除算ガード（その軸の回答が無い場合は中立=50）
      const score = totalPoints > 0 ? (positivePoints / totalPoints) * 100 : 50;
      return { axis, positivePoints, totalPoints, score };
    });
  },

  /**
   * 軸スコアから16タイプのコードを判定する（各軸 50% を閾値に二分）。
   * @param {Array} axisScores
   * @returns {string} 例: 'ETOP'
   */
  determineType(axisScores) {
    const byAxis = (axis) => axisScores.find((s) => s.axis === axis).score;
    const e = byAxis('E') >= 50 ? 'E' : 'A';
    const tl = byAxis('T/L') >= 50 ? 'T' : 'L';
    const oi = byAxis('O/I') >= 50 ? 'O' : 'I';
    const pc = byAxis('P/C') >= 50 ? 'P' : 'C';
    return `${e}${tl}${oi}${pc}`;
  },

  /**
   * 確度（各軸が中立=50からどれだけ離れているか）を 0-100 で算出。
   * @param {Array} axisScores
   * @returns {number}
   */
  calculateConfidence(axisScores) {
    const deviations = axisScores.map((s) => Math.abs(s.score - 50));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    return Math.min(100, Math.round(avgDeviation * 2));
  },

  /**
   * 回答一式から診断結果オブジェクトを組み立てる。
   * @param {Array} answers
   * @param {string} timestamp ISO 8601 文字列（呼び出し側で生成）
   * @returns {object} DiagnosisResult 相当
   */
  buildResult(answers, timestamp) {
    const axisScores = this.calculateAxisScores(answers);
    const personalityType = this.determineType(axisScores);
    const confidence = this.calculateConfidence(axisScores);
    return { timestamp, answers, axisScores, personalityType, confidence };
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DiagnosisCalculator, AXES };
}

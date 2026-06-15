# 職業タイプ診断 ⇄ 候補者プロファイルシステム 連携仕様

職業タイプ診断（`type-test/`）と、候補者プロファイル／面談予約システム（`app/`）の連携をまとめた資料です。
**両システムは同一の16タイプ体系と「連携コード」を共有**しており、診断結果がプロファイルへ正確に引き継がれます。

---

## 0. 全体像

```
[候補者] 職業タイプ診断 (type-test, 静的サイト)
      │  20問・5段階 → 4軸スコア → 16タイプ判定
      │
      ├─(A) 結果画面に「コーチ連携コード（4文字）」を表示
      │        → コーチが手入力 → プロファイルの「適性テスト」タブ
      │
      └─(B)「相談してみる」→ 面談予約ページ /booking.html?code=XXXX
               → 予約送信時に候補者の test(4軸) に自動反映
                                                  │
                                  [社内] 候補者プロファイル (app/)
                                   適性テストタブに同一タイプが再現
```

- 2システムは**別デプロイ**（type-test=静的サイト、app=Vite製SPA）。直接データ共有はせず、**4文字の「連携コード」**だけを受け渡す。
- コードは各軸スコアを符号化したもの。**type-test の判定と プロファイルの判定が必ず一致**するよう設計されている（後述・全網羅検証済み）。

---

## 1. 共有するタイプ体系（正本 = type-test-spec）

### 4軸（タイプコードの桁順）

| 桁 | 軸（theme） | スコア ≥ 0（左の極／コード文字） | スコア < 0（右の極） |
|---|---|---|---|
| 1 | 才能 | **S** = 戦略 | **E** = 共感 |
| 2 | 働き方 | **T** = チーム | **L** = 個人 |
| 3 | 判断 | **O** = 論理 | **I** = 直感 |
| 4 | 構え | **P** = 楽観 | **C** = 悲観 |

- 各軸スコアの範囲は **−10 〜 +10**。
- 判定ルール：**スコア ≥ 0 → 左の極（S/T/O/P）／ スコア < 0 → 右の極（E/L/I/C）**。0ちょうどは左の極。
- 4桁を連結したものがタイプコード（例：`STOP`、`ELIC`）。2⁴ = **16タイプ**。

### 採点（type-test 側）

- 20問（4軸 × 5問）。各設問は1つの軸に紐づき、向き `dir`（+1=順方向／−1=逆方向）を持つ。
- 5段階回答：はい`+2` / どちらかといえばはい`+1` / どちらでもない`0` / どちらかといえばいいえ`−1` / いいえ`−2`。
- 軸スコア = `Σ(回答値 × dir)`（5問なので −10〜+10）。

### 16タイプ一覧

| コード | タイプ名 | English |
|---|---|---|
| STOP | 未来の指揮官 | The Commander |
| STOC | 堅実な参謀 | The Tactician |
| STIP | 発想の伝道師 | The Visionary |
| STIC | 慎重な編集者 | The Editor |
| SLOP | 前向きな戦略家 | The Strategist |
| SLOC | 静かな分析家 | The Analyst |
| SLIP | 独立の革新者 | The Innovator |
| SLIC | 探究の哲学者 | The Philosopher |
| ETOP | 共感の推進者 | The Catalyst |
| ETOC | チームの調律師 | The Harmonizer |
| ETIP | 人を灯す案内人 | The Mentor |
| ETIC | 物語の紡ぎ手 | The Storyteller |
| ELOP | 信頼の伴走者 | The Counselor |
| ELOC | 寄り添う実務家 | The Caretaker |
| ELIP | 静かな共鳴者 | The Empath |
| ELIC | 手仕事の癒し手 | The Artisan |

> タイプの `name / nameEn / blurb / features(3点)` は **type-test と プロファイルで同一内容**。
> 実体：`type-test/js/types.js` の `TYPE_DEFINITIONS` ＝ `app/src/data/typesCatalog.ts` の `TYPES`。

---

## 2. 連携コードの仕様（最重要・契約）

各軸スコア（−10〜+10）を **1文字**に符号化し、4軸ぶん連結した **4文字コード**。

```
文字テーブル: CODE_CHARS = "0123456789ABCDEFGHIJK"   // index 0..20
エンコード:   char  = CODE_CHARS[ score + 10 ]        // score(-10..10) → index(0..20)
デコード:     score = CODE_CHARS.indexOf(char) - 10
```

| スコア | −10 | −5 | −1 | 0 | +1 | +5 | +10 |
|---|---|---|---|---|---|---|---|
| 文字 | 0 | 5 | 9 | A | B | F | K |

- 軸の並びは **才能 → 働き方 → 判断 → 構え**（タイプコードと同じ桁順）。
- 例：軸スコア `+3, +7, −2, +5` → コード `DH8F` → タイプ `STIP`（軸3が −2 で I＝直感）。
- 有効なコードは **0–9 / A–K の4文字ちょうど**。それ以外は無効（プロファイル側は無視）。

### 判定の一致保証

- type-test：`スコア ≥ 0 → 左の極`
- プロファイル：デコードした `スコア ≥ 0 → 左の極`

両者は同一閾値なので、**type-test が出したタイプ ＝ プロファイルがコードから復元するタイプ** が常に一致する。
全軸スコアの全組み合わせ **194,481通り（21⁴）で不一致 0** を確認済み。

---

## 3. 連携の2経路

### (A) コーチ連携コード（手入力）

1. 候補者が診断を完了 → 結果画面に **「コーチ連携コード」**（例 `DH8F`）＋コピーが表示される。
2. 候補者が面談時にコーチへコードを伝える。
3. コーチがプロファイルの **候補者 → 適性テストタブ** にコードを入力 → 4軸スコアが自動セットされ、診断と同一タイプが表示される。

### (B) 予約への自動引き継ぎ

1. 結果画面の主CTA **「この結果をふまえてキャリア相談を予約する」** が `面談予約ページ + ?code=XXXX` にリンク（`type-test/js/data.js` の `LINK.BOOKING_URL`）。
2. 予約ページがURLの `code` を読み取り、引き継ぎバナーを表示。
3. 予約送信時、`buildBookingRecords()` が `codeToScores(code)` で候補者の `test`（4軸）に反映 → 生成された候補者プロファイルに診断結果が最初から入る。

---

## 4. ファイル対応表

### type-test（職業タイプ診断・静的サイト / v2 紙トレカ版）

| ファイル | 役割（連携の観点） |
|---|---|
| `js/data.js` | 設問20問（`ax`・`dir`）・`SCALE`（5段階）・16タイプ `TYPES`・採点 `scoreAnswers`・**連携コード `encodeCode`/`codeToScores`/`CODE_CHARS`**・`LINK.BOOKING_URL`。`window.TYPETEST` に公開 |
| `js/result.js` | 結果カード描画。**連携コード表示＋コピー（経路A）**、主CTAに `LINK.BOOKING_URL + '?code='`（経路B）、画像保存／シェア |
| `index.html` | 診断フロー（start→4章→loading→result）。`js/data.js`・`js/result.js`・`css/style.css` を読み込み |
| `css/style.css` | デザイントークン＋全画面スタイル（紙／活版） |
| `types.html` / `save-cards.html` / `export.html` | 16タイプ図鑑・IG用カード書き出しツール |

> タイプ本文（`name/en/blurb/strengths`）は `js/data.js` の `TYPES` ＝ `app/src/data/typesCatalog.ts` の `TYPES`（`feats` = `strengths`）で**同一内容を二重管理**。

### プロファイル／予約（`app/`）

| ファイル | 役割（連携の観点） |
|---|---|
| `src/lib/codes.ts` | `AXES`・`CODE_CHARS`・`scoreToChar/charToScore`・`scoresToCode/codeToScores`・`scoresToTypeCode`・`typeOf` |
| `src/data/typesCatalog.ts` | `TYPES`（16タイプ）。**type-test の `types.js` と同一内容** |
| `src/lib/booking.ts` | `buildBookingRecords()`：`testCode` を `codeToScores` で候補者 `test` に反映 |
| `src/lib/types.ts` | `WebhookPayload.testCode`（予約への引き継ぎコード） |
| `src/booking/BookingApp.tsx` | 予約ページ。`?code=` を読み取り→バナー→送信ペイロードに付与 |
| `src/components/profile/tabs/TabAptitude.tsx` | 適性テストタブ。コード入力 → `codeToScores` → `typeOf` で表示 |

---

## 5. 変更時の注意（同期）

- **16タイプ定義は type-test と プロファイルで二重管理**（`types.js` と `typesCatalog.ts`）。
  どちらかを変えたら **必ず両方を同一内容に更新**すること。
- **軸の定義・判定閾値・コード仕様（§1・§2）を変える場合は両システム同時に**。片方だけ変えると連携コードの整合が崩れる。
- 設問（`questions.js`）は type-test 専用。軸スコアの算出方法を変えても、最終的に **−10〜+10 の軸スコア → コード** の契約さえ守れば連携は保たれる。

---

## 6. 必要な設定

- `type-test/js/data.js` の **`LINK.BOOKING_URL`** を、面談予約ページの**本番デプロイURL**に設定する（既定 `'/booking.html'`）。
  例：`const LINK = { BOOKING_URL: 'https://booking.example.com/booking.html' };`

---

## 7. 早見表（サニティチェック）

| 入力 | 結果 |
|---|---|
| 全問「はい」(+2) | 軸スコア `+2,+2,+2,+2` → コード `CCCC` → タイプ `STOP` |
| 全問「いいえ」(−2) | 軸スコア `−2,−2,−2,−2` → コード `8888` → タイプ `ELIC` |
| コード `DH8F` | スコア `+3,+7,−2,+5` → タイプ `STIP`（発想の伝道師） |

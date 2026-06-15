# 候補者プロファイルシステム — 機能・デザイン仕様（現状まとめ）

可能性LABO の社内向け **候補者プロファイル／面談予約システム**（`app/`）の、現時点の機能・構成・デザインを一枚にまとめた資料。
関連：[coaching-overview.md](coaching-overview.md)（コーチング事業）／[../type-test/INTEGRATION.md](../type-test/INTEGRATION.md)（職業タイプ診断との連携）。

---

## 0. 全体像

3つの surface が同じデータ層（localStorage / Supabase）を共有：

| URL / 入口 | 役割 | 利用者 |
|---|---|---|
| `index.html`（`/`） | **候補者プロファイル管理**（一覧・スケジュール・予約フォーム管理・プロファイル） | 社内（コーチ・管理者） |
| `booking.html`（`/booking.html`） | **面談予約ページ**（公開・別デザイン） | 候補者 |
| 職業タイプ診断（別リポ `type-test/`） | 無料の16タイプ診断 → 連携コードで結果を引き継ぎ | 候補者 |

集客ファネル：**無料体験予約 → 体験完了 →（決済）→ コーチング中 → 完了 →（人材紹介へ送客）**

---

## 1. 技術スタック

- **Vite + React 18 + TypeScript**（SPA・マルチページ：admin / booking）
- **Supabase**（任意）：env 設定時はSupabase、未設定なら **localStorage** で自動動作（プロトタイプ同等・即起動）
- 状態：React Context（`store/AppStore.tsx`）＋ リポジトリ層（`store/repository.ts`）
- テスト：Vitest（純ロジック 21件）
- 開発：`cd app && npm run dev` → `http://localhost:5173/`

---

## 2. 画面・機能

### 2-1. 候補者一覧（ホーム）`components/list/ListView.tsx`
- **カンバン / リスト の切替**（既定カンバン）
- **カンバン**：ステージ4列（無料体験予約／体験完了／コーチング中／完了）にカード。各カードの**セレクトでステージ変更**（ドラッグ無し v1）。列ヘッダに件数。
- **リスト**：詳細カード＋**ステージのチップ絞り込み**（件数バッジ）。
- 共通：**検索**（氏名・職業・コーチ・住まい）、**セグメント絞り込み**（新卒/中途）、集計バー（総数 / コーチング中 / 完了）。
- カード表示：ステージバッジ・セグメント・送客ステータス・タイプチップ・総合スコア（コーチング契約者は「プラン n/回数」）。
- 「新規追加」で空の候補者を作成しプロファイルへ。

### 2-2. スケジュール `components/schedule/ScheduleView.tsx`
- **月 / 週 / 日 / リスト** ビュー切替、`< 今日 >` ナビ。
- 予定の追加・編集モーダル（候補者リンク／日時／種別／コーチ／ステータス）。
- 予定 → 候補者プロファイルへ遷移。空きセルクリックで新規。
- **Googleカレンダーに追加**リンク（コーチのカレンダーに面談日時を登録）。
- 「フォーム連携をデモ」で予約フォーム受信→候補者・予定の自動生成を確認。

### 2-3. 予約フォーム管理 `components/form/FormBuilderView.tsx`
- **フォーム項目**タブ：項目の追加・並べ替え・必須トグル・選択肢編集（この設定が公開予約ページの項目を駆動）。
- **時間枠設定**タブ：曜日別受付時間・1枠長さ・予約上限・受付期間・休止日。
- 右側に**ライブプレビュー**（候補者の見え方）。

### 2-4. 候補者プロファイル `components/profile/ProfileView.tsx`
- ヘッダー：アバター・氏名・セグメント/ステータスバッジ・KPI（総合スコア・タイプコード）・面談/担当メタ。
- **ステージ ステップバー**：無料体験予約─体験完了─コーチング中─完了（現在地ハイライト＋クリックで移動／右端「見送り」）。
- **7タブ**：

| # | タブ | 内容 |
|---|---|---|
| 01 | 基本情報 | 候補者情報＋**予約情報（予定と同一実体・即時反映）**。Googleカレンダー追加。 |
| 02 | 第一面談 | セグメント別の設問テンプレにメモ |
| 03 | 第二面談 | 共通設問にメモ |
| 04 | 適性テスト | **4文字コード入力 → 16タイプ判定＋4軸スライダー**（職業タイプ診断と連携） |
| 05 | 総合所見 | 6観点 星5評価（合計30）＋自由記述 |
| 06 | 送客判断 | 業界/職種/ステータス/次アクション/メモ |
| 07 | **コーチング** | プラン（¥80,000/¥150,000）・入金ステータス・進捗バー・**全セッション記録**・完了報告 |

- 入力は全タブ**600msデバウンス自動保存**（「保存中…→自動保存済み」表示）。タブに内容があると●ドット表示。

---

## 3. データモデル（`lib/types.ts`）

### Candidate（候補者）
`id / reservationToken / name / phone / exp / age / job / loc / seg(newgrad|career) / **stage** / src / date / coach / i1 / i2(面談メモ) / test(4軸) / asmt(総合所見) / place(送客判断) / **coaching** / at`

- **stage**：無料体験予約 / 体験完了 / コーチング中 / 完了 / 見送り（既定「無料体験予約」）
- **test**：`{axis1..4: -10..+10}`（適性テスト4軸。未実施は空）
- **coaching**：`{ plan, paymentStatus, startDate, sessions[], report }`

### Appointment（予定）
`id / candidateId / name / type(first|second) / coach / at / status(予定|完了|キャンセル) / source(form|manual)`
- 基本情報タブの「予約情報」＝主要 appointment と**同一実体**（編集はスケジュール・確認ページへ即反映）。

### FormConfig（予約フォーム設定）
`fields[]（項目）/ slots（曜日別受付・枠長さ・上限・受付期間・休止日）` — 公開予約ページを駆動。

### Coaching（コーチング）
`plan(standard|full) / paymentStatus(未入金|入金済) / startDate / sessions[]（テーマ・ゴール・実施日・実施済・サマリー・アクション・所感）/ report`

---

## 4. デザイン（UI）

- **方向性**：クリーン・モダンな SaaS ツール。ブランドはブルー基調（ロゴ由来 `#1379b8`）＋ニュートラルなクール系。Noto Sans JP。
- **デザイントークン**：`styles/styles.css` の `:root`（色・角丸・影・余白・タイポ）。プロトタイプから値そのまま移植。
- **主要コンポーネント**：アプリバー（sticky・blur）／カード／ステータス・セグメント・ステージのバッジ（tone別 bg/fg）／タイプチップ／フィルタchip／入力・セレクト・トグル／モーダル／トースト／保存インジケータ。
- **カンバン**：列＝ステージ（tone色）、コンパクトカード＋ステージ変更セレクト。
- **ステップバー**：ドット＋ラベル、現在地はブランドリングでハイライト、通過済みは塗り。
- **アイコン**：インラインSVG（`ui/Icon.tsx`、ストロークベース）。装飾絵文字は不使用。
- **レスポンシブ**：`max-width: 900px` で2カラム→1カラム、カンバンは1カラム積み。
- ※ 公開予約ページ（`booking/`）は別デザイン（紙ではなくブルー系・520px縦長・Shippori Mincho見出し）。職業タイプ診断（`type-test/`）はさらに別の紙トレカ／活版デザイン。

---

## 5. 連携・統合

- **職業タイプ診断 → プロファイル**：診断の**4文字連携コード**を適性テストタブに入力 → 同一16タイプを再現（往復一致を全網羅検証済み）。
- **予約ページ → プロファイル**：送信で候補者＋予定を自動生成（`source:form`／ステージ「無料体験予約」）。診断コードを `?code=` で引き継ぐと適性テスト結果も自動反映。
- **Googleカレンダー**：予定をコーチのカレンダーに追加（リンク方式・認証不要 v1）。
- **データ永続化**：`repository.ts` が localStorage / Supabase を抽象化。Supアプリは `supabase/migrations/0001_init.sql`（candidates / appointments / form_config、RLS・トリガ・`stage`/`coaching`カラム）。

---

## 6. 純ロジック＆テスト（`lib/`）

- `codes.ts`：4文字コード ⇄ 4軸スコア、16タイプ判定（`codes.test.ts`）
- `slots.ts`：時間枠生成（`slots.test.ts`）
- `stage.ts` / `coaching.ts` / `interview.ts` / `assessment.ts` / `datetime.ts` / `gcal.ts`
- Vitest **21件パス**、`tsc` 型エラー0、本番ビルド成功。

---

## 7. 現状の制約・未実装（次段階）

- **認証**：未実装（Supabase Auth メール/パスワードを予定。コーチ/管理者ロール）。
- **Realtime**：他ユーザ変更の即時反映は未実装（データ層は前提済み）。
- **決済（Stripe）**：体験完了→コーチング中ゲートに後付け予定（未実装）。
- **カンバンのドラッグ移動**：v1は無し（セレクト/ステップバーで変更）。
- **予約フォームWebhook**：Supabase Edge Function は雛形のみ（`supabase/functions/form-webhook`）。
- **タイムゾーン**：Supabase接続時の timestamptz 表示の Asia/Tokyo 固定は要対応（localStorageでは文字列保持で一致）。
- **コーチ向けダッシュボード**（今日やること）・**事前ヒアリング/議事メモ/完了報告のテンプレ生成**：構想段階。

---

## 8. 主要ファイル早見

```
app/
├─ index.html / booking.html         エントリ（管理 / 公開予約）
├─ src/
│  ├─ App.tsx / main.tsx             ルーティング・起動
│  ├─ store/  AppStore.tsx repository.ts   状態・永続化
│  ├─ lib/    types codes slots stage coaching gcal booking datetime assessment interview supabase
│  ├─ data/   typesCatalog(16タイプ) seed formDefaults
│  ├─ components/
│  │  ├─ list/ListView          一覧（カンバン/リスト）
│  │  ├─ schedule/ScheduleView  スケジュール
│  │  ├─ form/                  予約フォーム管理
│  │  ├─ profile/ProfileView    プロファイル＋ステップバー
│  │  │   └─ tabs/  TabBasic TabInterview TabAptitude TabAssessment TabCoaching
│  │  └─ ui/  Icon primitives   共通UI
│  └─ styles/styles.css          デザイントークン＋全CSS
└─ supabase/migrations/0001_init.sql   スキーマ
```

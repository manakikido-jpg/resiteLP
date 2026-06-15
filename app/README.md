# 可能性ラボ｜候補者プロファイル（React + Supabase 本番実装）

`reference_html/`（デザイン正本のプロトタイプ）を Vite + React + TypeScript + Supabase へ移植した本番アプリ。

2つの画面（同一データ層を共有）:

| URL | 役割 |
|---|---|
| `/`（`index.html`） | **社内**・候補者プロファイル管理（4画面） |
| `/booking.html` | **公開**・面談予約ページ（候補者向け） |

予約ページから送信すると、候補者＋予定が生成され**プロファイル側のスケジュール／候補者一覧に反映**されます（同一オリジン＝同じ localStorage / Supabase を共有）。

## 動かす

```bash
cd app
npm install
npm run dev        # 管理: http://localhost:5173/  予約: http://localhost:5173/booking.html
```

**Supabase 未設定でもそのまま動きます**（`localStorage` モード・シードデータ入り）。プロトタイプ同等の挙動で全画面を確認できます。

### Supabase に接続する

1. Supabase プロジェクトを作成
2. `supabase/migrations/0001_init.sql` を SQL Editor で実行（3テーブル＋RLS＋トリガ）
3. `.env.local` を作成（`.env.example` をコピー）し、URL と anon key を設定
4. `npm run dev` を再起動 → 自動で Supabase モードに切替

接続情報が無ければ `localStorage`、有れば Supabase を使う（`src/lib/supabase.ts` / `src/store/repository.ts`）。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバ |
| `npm run build` | 型チェック＋本番ビルド |
| `npm run test` | Vitest（純ロジックのユニットテスト） |
| `npm run typecheck` | 型チェックのみ |

## 構成

```
src/
├─ lib/            純ロジック（codes/slots/interview/assessment/datetime）＋型＋supabase
├─ data/           16タイプ定義 / フォーム既定値 / シード
├─ store/          AppStore（Context）＋ repository（localStorage / Supabase）
├─ components/
│  ├─ ui/          Icon・共通部品
│  ├─ list/        候補者一覧
│  ├─ schedule/    スケジュール（月/週/日/リスト＋予定モーダル）
│  ├─ form/        予約フォーム管理（項目／時間枠／プレビュー）
│  └─ profile/     プロファイル6タブ（基本/第一/第二/適性/総合/送客）
└─ styles/         styles.css（プロトタイプのデザイントークン／CSSを移植）
supabase/migrations/0001_init.sql
```

## 移植の要点

- **デザインは正本のまま**：`styles.css` とロゴを物理移植。見た目はプロトタイプと一致。
- **純ロジックは値・式を変えず移植**：4文字コード⇄4軸（`DH8F→STIP`）、16タイプ判定、枠生成。Vitest で担保（21件）。
- **同一実体ルール**：基本情報タブの「予約情報」＝主要 appointment と同一。編集はスケジュール／ヘッダへ即反映。
- **自動保存**：フィールド変更は 600ms デバウンスで repository に保存。

## 予約ページ ↔ プロファイルの連携（実装済み）

- **フォーム項目は `form_config.fields` 駆動**：プロファイルの「予約フォーム管理 > フォーム項目」で編集した項目を、予約ページがそのまま描画（双方向連携）。既定項目は予約ページの専用デザイン（氏名/電話＝必須、転職経験・年齢＝チップ、職業＝テキスト、お住まい＝47都道府県セレクト）に合わせてある。
- **空き枠は `form_config.slots` 駆動**：受付曜日/時間帯・休止日・受付期間・1枠の長さ・予約上限（capacity）から、予約ページのカレンダーと時間枠を生成。既存予定が capacity に達した枠は満枠表示。
- **セッション長は `slotMinutes` 連動**で表示。**「無料」表記は一切なし**（料金行も削除）。
- **送信処理**：`buildBookingRecords()`（`src/lib/booking.ts`）で候補者＋予定（`source:"form"`, `interviewType:"first"`）を生成し repository に保存。プロファイルの「フォーム連携をデモ」も同じ関数を使用。
- ファイル：`src/booking/`（`BookingApp` / `Calendar` / `SlotPicker` / `availability` / `data` / `booking.css`）。

### 連携の未決事項（要ビジネス確認）
- ヘッダ「トップへ」リンク先（`LP_URL`）は LP の本番URLに差し替え（現状 `/`）。
- 公開フォームの Supabase 書き込みは、本番では anon 用 insert ポリシーか Edge Function（service_role）経由に（現 RLS は authenticated のみ）。localStorage モードでは即連携。
- 受付時間に「昼休み等の中抜き」は現状の `weekly`（連続 start–end）では表現不可。必要なら時間帯を複数持てるよう拡張。

## このマイルストーンの範囲（4画面スケルトン＋予約ページ）

実装済み：管理4画面＋予約ページ、ルーティング、Supaスキーマ/型/CRUD、純ロジック＋テスト、localStorage 即動作、予約→プロファイル連携。

## 次マイルストーン（未実装・第二段階）

- **Supabase Realtime**（他ユーザ変更の即時反映）
- **認証ガード**（Supabase Auth メール/パスワード）
- **予約フォーム Webhook 受信**（`supabase/functions/form-webhook` Edge Function 実装）
- **候補者本人の予約確認ページ**（`reservation_token`）
- **タイムゾーン厳密化**：Supabase の `timestamptz` 表示を Asia/Tokyo に固定（現状は閲覧ブラウザのローカル時刻。localStorage モードでは文字列を保持するため一致）

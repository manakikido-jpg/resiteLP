# LP アップデート（キャリアコーチング LP `v4_white.html`）

ハンドオフの2要素を、文字化けなしのクリーンな日本語コードで用意しました。
あなたの `v4_white.html` に貼り付けてください（価格は **¥80,000 / ¥150,000** に統一済み）。

## 1. 料金プランセクション — `pricing-section.html`
- 貼る場所：**Comparison/Coaches(04) の後、Voices(旧05) の直前**。
- 後続セクションの**章番号を繰り上げ**：
  - Voices … `Chapter 06 — Voices` / `.sec-ghost`「06」/ `.st-num`「06」
  - FAQ … `Chapter 07 — FAQ` / ghost「07」/ st-num「07」
- 両ボタンは `#final`（最終CTA）へのページ内アンカー。実装でプラン選択を予約に引き継ぐなら `?plan=full` 等を付けると◎。

## 2. ページローダー — `page-loader.html`
- `<body>` 直後に **CSS＋マークアップ**、ページ末尾（`</body>` 直前）に **コントローラ `<script>`**。
- `assets/logo.png`（カラーロゴ）を参照。約2.2秒の擬似進捗＋6秒セーフティ。
- `prefers-reduced-motion` 対応済み。

---

## ⚠️ デプロイについて（要相談）
この LP（`v4_white.html`）は**まだリポジトリ／Vercelデプロイに含まれていません**。
本番に載せるには、実ファイルが必要です（貼り付けはエンコード破損＋base64画像のため不可）。

**やってほしいこと**：`v4_white.html` と `assets/logo.png` `assets/logo-white.png` をこのリポジトリに追加（例：`lp/` フォルダ）。
そのあと私が以下を行います：
1. 統合ビルドに組み込み（`scripts/build-vercel.mjs` でコピー）
2. 公開URLの決定（**公開トップ `/` をLPにして管理を `/admin` へ** ／ または `/lp/` で配信）
3. ファネルの導線を接続（予約ページの戻り先、type-test・マイページの「TOPへ」リンク）
4. 再デプロイ＆動作確認

> 現状 `/` は管理アプリ（ログイン）です。LPを「公開トップ」にするか、サブパス配信にするかだけ決めてください。

# Vercel デプロイ手順（全サイト統合）

リポジトリ全体を **1つのVercelプロジェクト**として配信する。ビルド時に各サイトを `dist/` に集約する。

## 配信されるURL（デプロイ後）
| パス | ページ |
|---|---|
| `/` | プロファイル管理（社内） |
| `/booking.html` | 面談予約（公開） |
| `/mypage/` | 候補者マイページ |
| `/type-test/` | 職業タイプ診断 |
| `/intern/` `/mid-career/` | 既存LP |

## 設定ファイル（このリポジトリに同梱済み）
- `vercel.json` … buildCommand / outputDirectory(`dist`)
- `scripts/build-vercel.mjs` … app(Vite)ビルド＋静的サイトを dist へコピー
- `package.json`（ルート）… `npm run build`
- `middleware.js` … Basic認証（アクセス制限・任意）

## デプロイ方法（どちらか）

### A. GitHub連携（推奨）
1. このリポジトリをGitHub等にpush。
2. Vercel → **Add New → Project** → リポジトリをImport。
3. 設定はほぼ自動（`vercel.json` を読む）：
   - Framework Preset: **Other**
   - Build Command: `node scripts/build-vercel.mjs`（自動）
   - Output Directory: `dist`（自動）
   - Root Directory: リポジトリのルート（変更不要）
4. Deploy。

### B. Vercel CLI
```bash
npm i -g vercel
vercel        # 初回：プロジェクト作成（プレビュー）
vercel --prod # 本番反映
```

---

## アクセス制限（リンク共有者だけ閲覧）

### 方法1：Basic認証（無料プランでOK・同梱の middleware.js）
Vercel プロジェクトの **Settings → Environment Variables** に2つ追加：

| Name | Value |
|---|---|
| `BASIC_AUTH_USER` | 任意のID（例：`labo`） |
| `BASIC_AUTH_PASS` | 任意のパスワード |

→ 再デプロイすると、**全ページでID/パスワードを要求**。URL＋ID/パスを知る人だけ閲覧可。
（環境変数を未設定にすると制限は無効＝誰でも閲覧。）

### 方法2：Vercel の Password Protection（Proプラン）
Settings → **Deployment Protection → Password Protection** をON。1つのパスワードで保護。
※ Pro($20/月〜)の機能。無料プランなら方法1を使用。

### 方法3：URLを共有相手にだけ渡す（簡易）
Vercelのプレビューデプロイは推測困難なURL。厳密な認証ではないが「知っている人だけ」運用は可能。確実に守るなら方法1/2を推奨。

---

## ローカルでビルド確認
```bash
node scripts/build-vercel.mjs   # → dist/ に全サイトが集約される
```

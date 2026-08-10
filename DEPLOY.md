# Vercel デプロイ手順（全サイト統合）

## 独自ドメイン `kanousei-labo.com`（www なし）

### 手順（この順番を守る）

1. **Vercel → Settings → Domains → `kanousei-labo.com` を Add**
2. 表示されたDNSレコードを、ドメインを管理している側（Cloudflare 等）に登録する
   - **Vercelの画面に出た値をそのまま使う。** IPやCNAME先は変わることがあるので、
     ドキュメントに書かれた値より画面のほうが正しい。
   - **Cloudflareを使う場合はプロキシを必ずOFF（グレーの雲 / DNS only）にする。**
     オレンジの雲のままだとVercelがSSL証明書を発行できず、
     SSL/TLSモードが `Flexible` だと無限リダイレクトでサイトが開かなくなる。
3. Vercel側が `Valid` になり、SSL証明書が発行されるのを待つ（数分〜1時間）
4. **`https://kanousei-labo.com/` が実際に開けることを確認する**
5. ここまで終わってから、下の「vercel.app を転送する」を適用する

### vercel.app を転送する（⚠️ 手順4の確認が済んでから）

`kanousei-labo.vercel.app` は Vercel の仕様で削除できない（プロジェクトに必ず1つ付く）。
表に出したくない場合は、新ドメインへ 308 転送してしまえば実質的に使われなくなる。

`vercel.json` の `trailingSlash` の下に、以下を追加してデプロイする。

```json
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "kanousei-labo.vercel.app" }],
      "destination": "https://kanousei-labo.com/:path*",
      "permanent": true
    }
  ]
```

**新ドメインが開けるようになる前にこれを入れてはいけない。**
入れると「新ドメインは未開通・旧ドメインは転送」となり、どこからもアクセスできなくなる。

### ドメイン切り替え後に必要な作業（コード以外）

| 優先 | 内容 |
|---|---|
| **必須** | **LINEリッチメニューのURL** を `https://kanousei-labo.com/booking.html` に変更 |
| **必須** | コーチに管理アプリの新URL `https://kanousei-labo.com/admin/` を伝える（`/` は選択画面になった） |
| 中 | Metaピクセルのドメイン認証に `kanousei-labo.com` を追加 |
| 低 | Supabase → Authentication → URL Configuration の Site URL |

---


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

### 方法1：Basic認証（middleware） — ⚠️ **未実装**
以前この項目には「同梱の `middleware.js` に `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` を設定すれば
全ページを保護できる」と書かれていたが、**`middleware.js` はこのリポジトリに存在しない**
（git履歴にも一度も無い）。環境変数を設定しても**何も保護されない**ので注意。
必要になったら `middleware.ts` を新規に作ること（機能要項 F-107）。

なお**管理アプリ（`/`）自体は Supabase Auth のログインが必須**で、
候補者データもRLSで匿名からは読めないため、データが露出しているわけではない。

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

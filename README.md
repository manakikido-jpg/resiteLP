# 可能性ラボ / 可能性LABO — LP リポジトリ

キャリア設計サービス「可能性ラボ」のランディングページ（LP）一式を管理するリポジトリです。
各ディレクトリは **それぞれ独立した Netlify サイト** としてデプロイされています。

## ディレクトリ構成

| ディレクトリ | 役割 | 主なファイル | Netlify Site ID |
|---|---|---|---|
| `intern/` | 学生インターン向け LP ＋ エントリー | `index.html`, `entry.html`, `logo.png` | `aa579145-4734-4f0c-9e2e-45e7faaefa59` |
| `mid-career/` | 中途・転職向け LP ＋ 診断予約 | `index.html`, `diagnosis.html`, `booking.html`, `logo.png` | `30b1277a-d11b-4ee9-9f70-0eecec5432e8` |
| `booking/` | 面談予約ページ（単体） | `index.html` | `e6466b70-c34a-4590-ae8c-0a53da98bcd9` |
| `type-test/` | 適性タイプ診断（未着手） | （空） | `5a1c19b1-8e3d-4c07-8f30-f5e863253362` |
| `logo-assets/` | ブランドキット（ロゴ・シンボル一式） | SVG / PNG（1x/2x/4x） | — |

> Site ID は Netlify 上の各サイトに再リンクするためのキーです（`.netlify/` は Git 管理外のため、ここに控えています）。
> Vercel プロジェクト: `kanousei-labo-lp`（projectId: `prj_u55GwTRnzbFdlOCurFkkbusNNoak`）

## ブランドアセットの運用ルール

- **正本（source of truth）は `logo-assets/`** です。色・ロゴの変更は必ずここを起点に行います。
- 各サイトは独立デプロイ（公開フォルダがサブフォルダ単位）のため、親フォルダの `logo-assets/` を参照できません。
  そのため各サイトフォルダ内の `logo.png` は **`logo-assets/` からの複製** です。
- ロゴを差し替える際は、`logo-assets/` を更新したうえで各サイトの `logo.png` も同期してください。
  - `intern/logo.png` ＝ `mid-career/logo.png` ＝ `logo-assets/toumei-01.png`（透過ロゴ・同一）

### logo-assets の種類

| 種別 | 用途 |
|---|---|
| `logo-primary` | 通常背景用フルロゴ |
| `logo-white` | 濃色背景用フルロゴ |
| `logo-mono-ink` / `logo-mono-sky` | モノクロ／単色フルロゴ |
| `symbol-*` | シンボルマーク（アイコン）単体 |

各種 `.svg`（推奨・無限スケール）と `.png`（1x / 2x / 4x）を用意。Web では SVG を優先してください。

## フォーム（リード獲得）— Netlify Forms 連携

`intern/entry.html`（エントリー）と `mid-career/diagnosis.html`（診断予約）の送信を
**Netlify Forms** に連携済みです。送信されたリードは各 Netlify サイトの管理画面
（**Forms** タブ）に蓄積され、CSV 出力・メール通知が可能です。

| ページ | フォーム名 | 収集項目 |
|---|---|---|
| `intern/entry.html` | `intern-entry` | 氏名 / 大学 / メール / 電話 ＋ 診断回答（`q_year`, `q_field`, `q_motivation`, `q_status`, `q_location`） |
| `mid-career/diagnosis.html` | `midcareer-diagnosis` | 氏名 / メール / 電話 ＋ 診断回答（`q_experience`, `q_age`, `q_status`, `q_location`） |

### 仕組み
- 各ページの `<body>` 末尾に **検出用の静的フォーム（`hidden`）** を置き、Netlify がデプロイ時にフォームを認識します。
- 実際の送信はチャット UI の `submitForm()` が `fetch('/')` で Netlify に POST します（既存の入力体験はそのまま）。
- スパム対策に honeypot（`bot-field`）を設定済み。送信失敗時はリードを失わないようエラー表示＋再送信可能にしています。

### ⚠️ デプロイ後に必要な設定（Netlify 管理画面）
1. 対象サイトを **再デプロイ**（フォーム検出はデプロイ時に行われるため必須）。
2. **Site configuration → Forms** でフォームが登録されたことを確認。
3. **Forms → Form notifications → Add notification → Email notification** で
   リードの**通知先メールアドレス**を設定（※コードではなく管理画面で設定する項目）。
4. 送信テストを行い、管理画面に届くことを確認。

> 補足: Netlify Forms はローカル（`file://` や `netlify dev` 以外）では動作しません。
> 実際の挙動確認は本番／プレビューのデプロイ環境で行ってください。無料枠は月100送信まで。

## デプロイ

各サイトは個別の Netlify サイトです。サブフォルダで作業し、それぞれのサイトへデプロイします。

```bash
# 例: intern サイトをデプロイ
cd intern
netlify deploy --prod
```

## メモ / 既知の事項

- `booking/index.html` と `mid-career/booking.html` は同一内容（各 約29.7MB）。
  画像/動画が base64 で埋め込まれており重いため、将来的に外部ファイル化（軽量化）の余地あり。
- `type-test/` は枠だけ確保済み（適性診断ページの予定）。

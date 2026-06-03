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

## フォーム（リード獲得）

- `intern/entry.html`（エントリー）と `mid-career/diagnosis.html`（診断予約）に入力フォームがあります。
- **送信先（バックエンド連携）の設定状況は本 README の更新で管理します。** ← 連携実装後にここを更新。

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

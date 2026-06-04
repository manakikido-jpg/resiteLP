# 可能性ラボ / 可能性LABO — LP リポジトリ

キャリア設計サービス「可能性ラボ」のランディングページ（LP）一式を管理するリポジトリです。
各ディレクトリは **それぞれ独立した 1 サイト** として公開する構成です。

## ディレクトリ構成

| ディレクトリ | 役割 | 主なファイル |
|---|---|---|
| `intern/` | 学生インターン向け LP ＋ エントリー | `index.html`, `entry.html`, `logo.png` |
| `mid-career/` | 中途・転職向け LP ＋ 診断予約 | `index.html`, `diagnosis.html`, `booking.html`, `logo.png` |
| `booking/` | 面談予約ページ（単体） | `index.html` |
| `type-test/` | 適性タイプ診断（未着手） | （空） |
| `logo-assets/` | ブランドロゴ（正本） | `kanousei_labo_logo.png` |

## ブランドアセットの運用ルール

- **正本（source of truth）は `logo-assets/kanousei_labo_logo.png`** です。ロゴの変更は必ずここを起点に行います。
- 各サイトは独立公開（公開フォルダがサブフォルダ単位）のため、親フォルダの `logo-assets/` を参照できません。
  そのため各サイトフォルダ内の `logo.png` は **`logo-assets/kanousei_labo_logo.png` からの複製** です。
- ロゴを差し替える際は、`logo-assets/kanousei_labo_logo.png` を更新したうえで各サイトの `logo.png` も同期してください。
  - `intern/logo.png` ＝ `mid-career/logo.png` ＝ `logo-assets/kanousei_labo_logo.png`（同一）

```bash
# ロゴ同期の例（リポジトリ直下で実行）
cp logo-assets/kanousei_labo_logo.png intern/logo.png
cp logo-assets/kanousei_labo_logo.png mid-career/logo.png
```

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

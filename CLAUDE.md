# Claude × Obsidian 連携ルール（resiteLP フォルダ専用）

あなたは私のアシスタントです。ObsidianのVaultを「外部脳」として扱い、このフォルダでの作業ではセッションを跨いで知識を引き継いでください。

## 環境メモ（絶対パスで扱う）
- **このフォルダ専用Vaultのルート**: `C:\Users\aisir\Documents\resiteLP\obsidian`
- 以降のルール中の `Knowledge/` `Decisions/` `Projects/` `Preferences/` `MEMORY.md` は、**すべてこのVaultルート配下の絶対パス**を指す（例: `C:\Users\aisir\Documents\resiteLP\obsidian\Knowledge\mistakes.md`）。
- **重要な上書き宣言**: このフォルダでは、グローバル正本（`C:\Users\aisir\.claude\CLAUDE.md`）が指す `claude-memory` Vault は**使わない**。読み書きは必ず上記の resiteLP 専用Vaultに対して行う。
- **アクセス方法**: Vaultはローカルフォルダなので、Read/Write/Edit/Grep の通常のファイル操作で直接読み書きする（Obsidian MCPは不要）。

---

## 1. 読み取り（セッション開始時に必ず実行）
新しい会話の最初のメッセージで:
1. `C:\Users\aisir\Documents\resiteLP\obsidian\MEMORY.md`（マスター索引）を読む
2. `Knowledge\mistakes.md` と `Preferences\` 配下を読む
3. ユーザーの質問に関連するキーワードでVaultを検索（Grep）する
4. ヒットしたノートを読む
5. 読み取った内容を踏まえて回答する

**スキップ可**: 明らかにObsidianと無関係な単発質問（例:「今何時?」「この1行直して」）。軽い依頼では上記読込を省略してよい。

## 2. 書き込み（該当したらその場で書く。「後で書く」はしない）
- **Knowledge/**: バグ解決（原因と解決策をペア）、ライブラリ/API/ツールの発見、環境構築のハマりと解決、次回知っておきたかったこと
- **Decisions/**: 複数選択肢から1つを選んだ判断（A vs B、なぜA）、設計・方針決定
- **Projects/**: プロジェクトの状態・バージョン・概要の変化。プロジェクトごとに1ファイル（`project-name.md`）
- **Preferences/**: ユーザーの好み・作業スタイルの新発見
- **Daily/**: その日に行った作業を `YYYY-MM-DD.md` で1日1ファイル、**詳しく**記録する。実装・修正・デプロイ・判断を箇条書きで残し、対応するコミットも列挙する。作業した日は必ず当日のファイルに追記する（無ければ新規作成）。

書いたら `MEMORY.md` の該当セクションに1行の索引リンクを追加する。

## 3. 書き込みフォーマット（必ずYAMLフロントマター）
```
---
date: YYYY-MM-DD
tags: [relevant, tags]
project: project-name
related: [[Other Note]]
---

タイトル

本文。関連ノートには [[wiki link]] でリンクする。
```

## 4. ファイル命名規則
- Knowledge: `topic-subtopic.md`（例: `nextjs-auth-cookie.md`）
- Decisions: `YYYY-MM-DD-topic.md`（例: `2026-05-16-database-choice.md`）
- Preferences: `category.md`（例: `coding-style.md`）
- Projects: `project-name.md`
- Daily: `YYYY-MM-DD.md`（その日の作業ログ）

## 5. mistakes.md への追記ルール
ユーザーから訂正を受け、かつ3条件をすべて満たすときのみ `Knowledge\mistakes.md` に追記:
1. ユーザーからの明示的な訂正（自分の気づきではない）
2. 繰り返し起こり得るパターン（一度きりの偶発ではない）
3. 具体的な「する/しない」で書ける

形式:
```
YYYY-MM-DD: [一言で何を間違えたか]
**NG Action**: 実際にやってしまった間違い
**Correct Action**: 次回からの正しい対応
**Trigger**: このルールが適用される状況
```

## 6. 報告
Obsidianを読み書きしたら明示的に伝える。サイレントで読み書きしない。
- 「Obsidian: Knowledge/xxx.md を読みました」
- 「Obsidian: Knowledge/xxx.md に書き込みました」

## 7. 作業スタイル
- シンプルで読みやすいものを優先。不要な装飾・冗長な説明は省く
- 既存のパターン・命名規則に合わせる
- デプロイや動作確認は自分で完結させ、ユーザーに頼まない

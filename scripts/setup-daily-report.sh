#!/usr/bin/env bash
# =========================================================
# 日次レポートのセットアップ / 復旧スクリプト
#
#   bash scripts/setup-daily-report.sh
#
# VPSは使い捨ての作業ミラーという設計で、実際に再構築されて
# cronごと消えたことがある（2026-08-10）。そのため、cron登録を
# 手作業ではなくこのスクリプトに寄せて、1コマンドで戻せるようにする。
#
# 認証情報（~/.config/kanousei-report/secrets.env）は
# **このスクリプトでは作らない**。リポジトリに秘密を持ち込まないため、
# 中身は手で入れる。雛形だけ作る。
# =========================================================
set -euo pipefail

CONFIG_DIR="$HOME/.config/kanousei-report"
SECRETS="$CONFIG_DIR/secrets.env"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO/scripts/daily-report.mjs"
LOG="$HOME/.local/state/kanousei-report.log"
HOUR="${REPORT_HOUR:-9}"   # 送信時刻（JST・時）。REPORT_HOUR=8 のように上書き可

echo "== 日次レポートのセットアップ =="
echo "  リポジトリ: $REPO"

# --- 1) 設定ディレクトリと雛形 ---
mkdir -p "$CONFIG_DIR" "$(dirname "$LOG")"
chmod 700 "$CONFIG_DIR"
if [ ! -f "$SECRETS" ]; then
  cat > "$SECRETS" <<'ENVEOF'
# 日報の認証情報。リポジトリには絶対に入れない。
# LINE      : LINE Developers → Messaging API設定 → チャネルアクセストークン（長期）
# LINE_TARGET_ID : 送信先のグループID（C で始まる）
# CLARITY   : clarity.microsoft.com → Settings → Data Export
# META      : ビジネス設定 → システムユーザー → トークン生成（ads_read）
LINE_CHANNEL_ACCESS_TOKEN=
LINE_TARGET_ID=
CLARITY_API_TOKEN=
META_AD_ACCOUNT_ID=
META_ACCESS_TOKEN=
ENVEOF
  echo "  雛形を作成: $SECRETS  ← 中身を手で入れてください"
else
  echo "  既存の設定を使用: $SECRETS"
fi
chmod 600 "$SECRETS"

# --- 2) 動作確認（送信はしない） ---
echo "== 動作確認（dry-run・送信しません） =="
if ! node "$SCRIPT" --dry-run; then
  echo "!! dry-run が失敗しました。認証情報を確認してください" >&2
  exit 1
fi

# --- 3) cron 登録 ---
# nvm 環境では cron から node が見えないため、node の絶対パスを埋める
NODE_BIN="$(command -v node)"
LINE="0 $HOUR * * * $NODE_BIN $SCRIPT >> $LOG 2>&1"
TMP="$(mktemp)"
crontab -l 2>/dev/null | grep -v "daily-report.mjs" > "$TMP" || true
echo "$LINE" >> "$TMP"
crontab "$TMP"
rm -f "$TMP"

echo "== 完了 =="
echo "  毎日 ${HOUR}:00（JST）に送信します"
echo "  ログ: $LOG"
echo
echo "  今すぐ1通送る:   node $SCRIPT"
echo "  内容だけ見る:     node $SCRIPT --dry-run"
echo "  cronを確認:      crontab -l"

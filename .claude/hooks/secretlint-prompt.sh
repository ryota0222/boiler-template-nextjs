#!/bin/bash
set -o pipefail

INPUT=$(cat)
PROMPT=$(printf '%s' "$INPUT" | jq -r '.prompt // empty')

[ -z "$PROMPT" ] && exit 0

if [ -z "$CLAUDE_PROJECT_DIR" ] || ! cd "$CLAUDE_PROJECT_DIR"; then
  echo "CLAUDE_PROJECT_DIR が未設定のため、シークレット検査をスキップしました。" >&2
  exit 0
fi

if [ ! -x node_modules/.bin/secretlint ]; then
  echo "secretlint が未インストールのため、プロンプトのシークレット検査をスキップしました。'pnpm install' を実行してください。" >&2
  exit 0
fi

RESULT=$(printf '%s' "$PROMPT" | node_modules/.bin/secretlint --stdinFileName=prompt.txt 2>&1)
STATUS=$?

if [ "$STATUS" -ne 0 ]; then
  {
    echo "プロンプト本文にシークレットの可能性がある文字列が検出されました。シークレットを削除してから再送信してください。"
    printf '%s\n' "$RESULT"
  } >&2
  exit 2
fi

exit 0

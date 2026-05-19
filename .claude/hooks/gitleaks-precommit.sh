#!/bin/bash
set -o pipefail

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')

[ -z "$COMMAND" ] && exit 0

if [ -z "$CLAUDE_PROJECT_DIR" ] || ! cd "$CLAUDE_PROJECT_DIR"; then
  echo "CLAUDE_PROJECT_DIR が未設定のため、シークレット検査をスキップしました。" >&2
  exit 0
fi

if ! command -v gitleaks > /dev/null 2>&1; then
  echo "gitleaks が未インストールのため、シークレット検査をスキップしました。'mise install' を実行してください。" >&2
  exit 0
fi

if printf '%s' "$COMMAND" | grep -Eq 'git( .*)? commit'; then
  RESULT=$(gitleaks git --pre-commit --staged --redact --no-banner --exit-code 7 2>&1)
  STATUS=$?
elif printf '%s' "$COMMAND" | grep -Eq 'git( .*)? push'; then
  RESULT=$(gitleaks git --redact --no-banner --exit-code 7 2>&1)
  STATUS=$?
else
  exit 0
fi

# gitleaks は --exit-code 7 でリーク検出時のみ 7 を返す。それ以外の非 0 は gitleaks 自体の実行失敗のため誤検知扱いしない
if [ "$STATUS" -eq 7 ]; then
  {
    echo "コミット/プッシュ対象にシークレットの可能性がある文字列が検出されました。検出された値を削除してから再実行してください。"
    printf '%s\n' "$RESULT"
  } >&2
  exit 2
elif [ "$STATUS" -ne 0 ]; then
  {
    echo "gitleaks の実行に失敗したため、シークレット検査をスキップしました。"
    printf '%s\n' "$RESULT"
  } >&2
  exit 0
fi

exit 0

#!/bin/bash
set -o pipefail

INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE_PATH" ] && exit 0
[ -z "$CLAUDE_PROJECT_DIR" ] && exit 0

# テンプレート本体の保守時はガードを無効化する（派生プロジェクトには配布しない）
[ -f "$CLAUDE_PROJECT_DIR/.claude/.template-dev" ] && exit 0

grep -Eq 'isConfigured:[[:space:]]*false' "$CLAUDE_PROJECT_DIR/src/helpers/theme.ts" 2> /dev/null || exit 0

case "$FILE_PATH" in
  */src/helpers/theme.ts) exit 0 ;;
  */src/*) ;;
  *) exit 0 ;;
esac

echo "デザインの初期設定（accentColor / radius / appearance / voice & tone）が未決定です。実装の前に /setup-theme を実行し、src/helpers/theme.ts を確定してください。" >&2
exit 2

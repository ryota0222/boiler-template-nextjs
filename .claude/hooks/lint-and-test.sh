#!/bin/bash

# Claude Code がファイルを書き換えるたびに動くため、待ち時間を短くする。
# 書き換えたファイルの lint と format、そのファイルを読み込む unit のテストだけを並べて走らせる。
# テスト全体と Storybook（a11y）のプロジェクトは、pre-push の pnpm test に任せる

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

if [[ "$FILE_PATH" == *.config.ts ]]; then
  exit 0
fi

OUTPUT_DIRECTORY=$(mktemp -d)
trap 'rm -rf "$OUTPUT_DIRECTORY"' EXIT

cd "$CLAUDE_PROJECT_DIR" || exit 0

pnpm exec eslint "$FILE_PATH" > "$OUTPUT_DIRECTORY/lint" 2>&1 &
LINT_PID=$!
pnpm exec prettier --check "$FILE_PATH" > "$OUTPUT_DIRECTORY/format" 2>&1 &
FORMAT_PID=$!
# 関係するテストがないファイル（型だけのファイルなど）を失敗にしないよう、--passWithNoTests を付ける
pnpm exec vitest related "$FILE_PATH" --run --project unit --passWithNoTests > "$OUTPUT_DIRECTORY/test" 2>&1 &
TEST_PID=$!

RESULTS=""

if ! wait "$LINT_PID"; then
  RESULTS="ESLint errors:\n$(cat "$OUTPUT_DIRECTORY/lint")"
fi

if ! wait "$FORMAT_PID"; then
  RESULTS="$RESULTS\n\nPrettier errors:\n$(cat "$OUTPUT_DIRECTORY/format")"
fi

if ! wait "$TEST_PID"; then
  RESULTS="$RESULTS\n\nTest failures (related unit tests):\n$(cat "$OUTPUT_DIRECTORY/test")"
fi

if [ -n "$RESULTS" ]; then
  CONTEXT=$(echo -e "$RESULTS" | jq -Rs .)
  echo "{\"additionalContext\": $CONTEXT}"
fi

exit 0

#!/bin/bash

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

if [[ "$FILE_PATH" == *.config.ts ]]; then
  exit 0
fi

RESULTS=""

if ! LINT_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx eslint "$FILE_PATH" 2>&1); then
  RESULTS="ESLint errors:\n$LINT_OUTPUT"
fi

if ! FMT_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx prettier --check "$FILE_PATH" 2>&1); then
  RESULTS="$RESULTS\n\nPrettier errors:\n$FMT_OUTPUT"
fi

if ! TEST_OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx vitest run 2>&1); then
  RESULTS="$RESULTS\n\nTest failures:\n$TEST_OUTPUT"
fi

if [ -n "$RESULTS" ]; then
  CONTEXT=$(echo -e "$RESULTS" | jq -Rs .)
  echo "{\"additionalContext\": $CONTEXT}"
fi

exit 0

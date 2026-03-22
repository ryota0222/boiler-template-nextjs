---
name: create-unit-test
description: Use when writing unit tests, creating test files, or when `/create-unit-test` is invoked. Triggers proactively when implementing new functions or modules that need test coverage.
---

# Create Unit Test

## Overview

Write unit tests for this project using Vitest. Tests are co-located with source files and written in Japanese.

## When to Trigger

- User asks to write or add tests
- User invokes `/create-unit-test`
- A new function or module is implemented that lacks tests
- Refactoring existing code that has no test coverage

## Usage

```text
/create-unit-test [file-path]
```

- `file-path` (optional): Path to the source file to test (e.g., `src/libs/csv/parse.ts`)

## Procedure

### Step 1: Identify the target

- **Argument provided**: Use the specified file path as the target source file
- **No argument**: Search for source files that lack a corresponding `.test.ts` file and propose candidates to the user

```bash
# Find source files without tests
find src -name '*.ts' ! -name '*.test.ts' ! -name 'index.ts' | while read f; do
  [ ! -f "${f%.ts}.test.ts" ] && echo "$f"
done
```

If multiple files are found, present the list and ask the user which file(s) to test.

### Step 2: Read and analyze the source file

Read the target source file to understand:

- Exported functions and their signatures
- Edge cases and error conditions
- Dependencies that may need mocking

### Step 3: Create the test file

- **Location**: Same directory as the source file
- **Naming**: `{source-filename}.test.ts` (e.g., `parse.ts` → `parse.test.ts`)

### Step 4: Write tests following the template

```typescript
import { describe, expect, it } from 'vitest';

import { targetFunction } from '#@/libs/feature/targetFunction.js';

describe('targetFunction', () => {
  it('正常系: 期待される結果を返す', () => {
    // Arrange
    const input = 'test-data';

    // Act
    const actual = targetFunction(input);

    // Assert
    const expected = 'expected-result';
    expect(actual).toBe(expected);
  });

  it('異常系: 不正な入力でエラーをスローする', () => {
    expect(() => targetFunction(invalidInput)).toThrow('エラーメッセージ');
  });
});
```

### Step 5: Run and verify

```bash
npx vitest run src/libs/feature/targetFunction.test.ts
```

### Step 6: Compliance check

Read `.claude/rules/test-standards.md` and verify the written tests comply with **every rule** defined there. If any rule is violated, fix the test before proceeding.

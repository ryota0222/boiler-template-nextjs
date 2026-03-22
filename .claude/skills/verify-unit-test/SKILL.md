---
name: verify-unit-test
description: Use when unit tests have been written or modified, after running `/create-unit-test`, or before committing test files. Verifies branch coverage completeness and style compliance against test-standards rules.
---

# Verify Unit Test

## Overview

Verify that unit tests cover all branches in the source code and comply with `.claude/rules/test-standards.md`. If issues are found, invoke `create-unit-test` to fix them.

## Usage

```text
/verify-unit-test [file-path]
```

- `file-path` (optional): Path to a test file or source file to verify (e.g., `src/libs/csv/parse.test.ts` or `src/libs/csv/parse.ts`)
- No argument: verify all test files in `src/`

## Procedure

### Step 1: Identify targets

- **Argument is a `.test.ts` file**: Use it directly; derive the source file by removing `.test.ts` → `.ts`
- **Argument is a `.ts` source file**: Derive the test file by adding `.test.ts`
- **No argument**: Find all `.test.ts` files under `src/`

For each pair, verify that the test file exists. If missing, report it and skip to Step 4.

### Step 2: Branch coverage check

Read the source file and identify all branches:

| Branch type                  | What to look for                                   |
| ---------------------------- | -------------------------------------------------- |
| `if` / `else`                | Both truthy and falsy paths                        |
| `if` / `else if` / `else`    | Every branch including `else`                      |
| Ternary `? :`                | Both outcomes                                      |
| `switch` / `case`            | Every `case` + `default`                           |
| `??` / `\|\|` / `&&`         | Both short-circuit and non-short-circuit paths     |
| `try` / `catch`              | Both success path and error path                   |
| Early return / guard clause  | Both the guard-triggered path and the continuation |
| `.filter` / `.map` callbacks | Predicate returning `true` and `false`             |

Then read the test file and check if each branch has at least one corresponding test case.

**Output a coverage table:**

```text
| Branch (source:line) | Description          | Covered? |
|----------------------|----------------------|----------|
| parse.ts:12          | if input is empty    | ✅        |
| parse.ts:12          | else (non-empty)     | ✅        |
| parse.ts:20          | catch block          | ❌        |
```

### Step 3: Style compliance check

Read `.claude/rules/test-standards.md` and extract all rules. Check every test in the file against each rule.

**Output a compliance table:**

```text
| # | Rule (from test-standards.md) | Status | Issue (if any)              |
|---|-------------------------------|--------|-----------------------------|
| 1 | AAA pattern                   | ✅      |                             |
| 2 | `actual` variable             | ❌      | line 15: uses `result`      |
| ...                                                                      |
```

Note: `toBe`/`toEqual`-specific rules do NOT apply to `toThrow`, `toHaveBeenCalled`, etc. (as stated in the rules file).

### Step 4: Fix issues

If any branch is uncovered OR any style rule is violated:

1. Present the findings to the user
2. Invoke `create-unit-test` with the source file path to regenerate/fix the tests
3. After fixes, re-run this verification from Step 2 to confirm all issues are resolved

### Step 5: Final report

Once all checks pass, output a summary:

```text
✅ verify-unit-test: src/libs/csv/parse.test.ts
   Branches: 8/8 covered
   Style: 10/10 rules passed
```

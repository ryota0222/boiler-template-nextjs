# Implementation Patterns

<!-- Rules in this file are referenced by Claude Code during coding -->

## Blank Line Before Control Statements

- **Type**: MUST
- **Reason**: Variable declarations and control statements packed together reduce readability

### Details

Insert a blank line between variable declaration blocks and control statements (if/for/while/switch).

```typescript
// Good
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (url === undefined || key === undefined) {
  throw new Error('環境変数が未設定');
}

// Bad
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
if (url === undefined || key === undefined) {
  throw new Error('環境変数が未設定');
}
```

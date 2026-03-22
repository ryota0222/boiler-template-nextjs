# Dependency Policy

<!-- Rules in this file are referenced by Claude Code during coding -->

## Internal Directory Access

- **Type**: MUST NOT
- **Reason**: Encapsulation — internal modules are implementation details that must not leak outside their parent directory

### Details

Files inside `internal/` directories can only be imported by files in the same parent directory. Cross-directory access to `internal/` is forbidden and enforced by dependency-cruiser.

```typescript
// Good: same parent directory
// src/entities/time-entry/index.ts → src/entities/time-entry/internal/isoWeek.ts

// Bad: different parent directory
// src/gateways/csv/index.ts → src/entities/time-entry/internal/isoWeek.ts
```

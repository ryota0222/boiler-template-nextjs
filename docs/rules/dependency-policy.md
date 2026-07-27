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

## Gateways May Import Library Clients From Helpers

- **Type**: MAY
- **Reason**: `helpers/` is where a configured library instance lives (an axios instance, a dayjs setup). The layer that uses such an instance is the one performing I/O — `gateways/`. Forbidding the whole of `helpers/` makes the `apiClient` pattern that `helpers.md` itself documents impossible to implement.

### Details

A gateway may import from `helpers/` only when the file is a library client, named `<name>Client.ts` directly under `src/helpers/`. Everything else in `helpers/` remains off limits, so the allowance cannot widen into a general escape hatch.

```typescript
// Good: a configured library instance
// src/gateways/user/userGateway.ts → src/helpers/apiClient.ts

// Bad: an arbitrary utility
// src/gateways/user/userGateway.ts → src/helpers/formatting.ts
```

A client typed with the application's own schema — a generated database type, for example — is not domain-independent and therefore does not belong in `helpers/` at all (`helpers.md`: "no entity references"). Keep it in `gateways/`.

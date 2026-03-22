---
description: Rules for gateway definitions in src/gateways/
paths: ['src/gateways/**/*.ts']
---

# Gateway Rules

## What is a Gateway

Gateways are the I/O boundary of the application, responsible for communication with external data sources (API, DB, CSV files, etc.). They encapsulate all external access and return domain entity types.

## Structure

Each gateway file exports:

1. Async functions that perform I/O with external data sources
2. Return values are always domain entity types (defined in `src/entities/`)

```typescript
import { schema, type Airport } from '@/entities/airport';

export const fetchAirports = async (): Promise<Airport[]> => {
  const response = await fetch('https://api.example.com/airports');
  const data = await response.json();
  return schema.array().parse(data);
};
```

## Directory Naming

Subdirectories are named by domain concept, matching `entities/` naming (e.g., `entities/airport/` ↔ `gateways/airport/`).

## No Business Logic in Gateways

Gateways contain only:

- External data source access (HTTP requests, DB queries, file reads, etc.)
- Conversion from external data to domain entity types (via zod parse)

No business logic, no domain rules, no orchestration of multiple gateways.

## Testing Guidelines

- Use test doubles (mock/stub) for external data sources
- Test that external data is correctly parsed into entity types
- Test error cases (network failure, invalid data, etc.)

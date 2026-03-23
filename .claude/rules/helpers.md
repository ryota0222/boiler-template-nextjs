---
description: Rules for helper definitions in src/helpers/
paths: ['src/helpers/**/*.ts']
---

# Helper Rules

## What is a Helper

Helpers provide shared utilities and library configurations used across the application. They are domain-independent and reusable (e.g., axios instance setup, dayjs configuration, common utility functions).

## Structure

Each helper file exports a configured instance or utility functions.

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});
```

## No Domain Logic in Helpers

Helpers contain only:

- Library configuration and initialization
- Domain-independent utility functions

No business logic, no domain rules, no entity references.

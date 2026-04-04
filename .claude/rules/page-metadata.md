---
description: Rules for Next.js page.tsx files (App Router)
paths: ['src/app/**/page.tsx']
---

# Page Metadata Rules

## Required Metadata Export

Every `page.tsx` must export a `metadata` constant of type `Metadata` from `next`.

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'ページの説明',
  title: 'ページタイトル | Awanotes',
};
```

## Title Format

Use `「ページ名 | Awanotes」` as the title format.

## Exception

Root `layout.tsx` owns the default metadata. Pages that intentionally inherit the layout's metadata without overriding it are exempt, but this should be rare — most pages should set their own title and description.

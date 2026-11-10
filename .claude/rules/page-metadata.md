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
  title: 'ページ名 | アプリ名',
};
```

## Title Format

Use `「ページ名 | アプリ名」` as the title format.

The application name is whatever the root `layout.tsx` sets as its `metadata.title`. Read it from there rather than restating it here — a second copy in this file would drift the moment the application is renamed.

## Exception

Root `layout.tsx` owns the default metadata. Pages that intentionally inherit the layout's metadata without overriding it are exempt, but this should be rare — most pages should set their own title and description.

## Search Engines

The template keeps every page out of search results, because most apps built from it are internal tools. Three settings work together, and each covers a gap the others leave:

| Setting                              | Covers                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| `src/app/robots.ts` (`Disallow: /`)  | Stops crawlers from fetching pages                                    |
| `metadata.robots` in the root layout | Keeps a page out of results even when another site links to its URL   |
| `X-Robots-Tag` in `next.config.ts`   | The same for responses that are not HTML (API responses, PDFs, files) |

Do not set `robots` in a page's own `metadata`; the root layout already covers every page.

For a public site, remove all three together, then add `src/app/sitemap.ts`. Removing only `robots.ts` leaves every page marked `noindex`, which search engines then drop.

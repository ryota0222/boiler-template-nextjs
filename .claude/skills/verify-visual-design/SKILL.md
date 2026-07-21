---
name: verify-visual-design
description: Use when a page or feature component has been added or its layout changed, or when `/verify-visual-design` is invoked. Renders stories in a browser and inspects them for layout breakage, state coverage, and content overflow.
---

# Verify Visual Design

## Overview

Render stories in a real browser and look at them. Automated gates catch accessibility violations and terminology drift, but nothing in the pipeline detects overflow, collapsed layout, or a missing state. This skill fills that gap.

## When Not To Use This

Skip it for primitives in `src/shared-components/`. A screenshot of a single button carries almost no information — its correctness is already covered by the a11y gate and by review of the variant stories.

Run it when the target is a composed screen: anything in `src/app/` or a feature that arranges multiple components.

## Usage

```text
/verify-visual-design [story-id]
```

- `story-id` (optional): A Storybook story ID (e.g. `features-order-list--empty`)
- No argument: verify every story under `src/features/` and every route in `src/app/`

## Procedure

### Step 1: Start Storybook

```bash
pnpm storybook
```

Wait until `http://localhost:6006` responds before continuing.

### Step 2: Resolve story IDs

A story ID is `{kebab-case title}--{kebab-case export name}`. The title comes from `meta.title` in the story file.

```text
title: 'features/OrderList' + export const Empty
  → features-order-list--empty
```

Render a story in isolation at:

```text
http://localhost:6006/iframe.html?id={story-id}&viewMode=story
```

Docs pages (`--docs`) only exist when `tags: ['autodocs']` is set on the meta. It is not set in this repository, so do not request them.

### Step 3: Capture

For each story, capture at two viewports. Light mode only — dark mode tokens exist in `globals.css` but no mechanism applies the `.dark` class, so there is nothing to verify.

| Viewport | Width | Height |
| -------- | ----- | ------ |
| Compact  | 375   | 812    |
| Wide     | 1440  | 900    |

Use the Playwright MCP tools: `browser_resize`, then `browser_navigate`, then `browser_take_screenshot`. Write screenshots under `tmp/` — it is gitignored. Never write them to the repository root.

Also take `browser_snapshot` to read the accessibility tree, which exposes heading order and landmark structure that axe does not check at the page level.

### Step 4: Inspect

Look for these, in order of how often they occur:

1. **Overflow** — text or content escaping its container at 375px
2. **Collapsed layout** — an element with no height or width because its content is empty
3. **Missing state** — the story set does not cover the states required by `design-states.md`
4. **Touch target size** — interactive elements smaller than roughly 44px at the compact viewport
5. **Heading order** — a level skipped, or more than one `h1`

### Step 5: Report

State what was checked and what was found. If nothing was found, say which stories and viewports were captured — a bare "looks fine" is not a result.

Fix findings in the component, then re-run from Step 3.

## Cleanup

The Playwright MCP tools write logs and snapshots to `.playwright-mcp/`, which is gitignored. Remove it when finished so it does not accumulate:

```bash
git clean -fdX .playwright-mcp
```

## Limits

Reading a screenshot detects breakage, not quality. It will not tell you whether a layout is well designed, whether the information hierarchy is right, or whether the interaction makes sense. Treat a clean pass as "nothing is broken", not "this is good".

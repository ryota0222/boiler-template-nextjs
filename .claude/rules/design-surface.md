---
description: Rules for how surfaces stack on a screen, so containers and embedded content read as separate layers
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Surface Rules

`design-layout.md` decides where blocks sit. This file decides what each block sits on, so a reader can tell at a glance which things belong together and which thing is not part of this screen at all. Which control wins is `design-hierarchy.md`; depth never carries importance.

## Three Layers, and the Map Is Fixed

- **Type**: MUST
- **Reason**: The page and its cards are the same white, so a border alone reads as a line drawn on one sheet rather than as the edge of another. Each layer needs a cue of its own, and the cue has to mean the same layer on every screen.

### Details

| Layer   | What sits there                                                      | Cue                                                                     |
| ------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Page    | The page header (title, breadcrumb, primary action), search, filters | The body colour (white), no border, no shadow                           |
| Surface | `Card`, `Paper`, panels, a table, an embedded preview                | A border and `shadow="xs"`; an embedded preview has its own cue (below) |
| Overlay | `Modal`, `Drawer`, notifications, `Popover`, `Menu`                  | `shadow="md"` or larger                                                 |

`Modal` and `Drawer` (`xl`) and notifications (`lg`) carry their shadow by default. `Popover` and `Menu` default to no shadow in Mantine 9.6.2, so pass `shadow="md"` explicitly, or a dropdown lies flat on the surface it opens over.

## The Page Stays the Body Colour

- **Type**: MUST NOT
- **Reason**: A screen that paints its own background drifts from every other screen by a shade, and the drift reads as a bug.

### Details

Neither `AppShellLayout` nor a screen sets a background on `AppShell.Main` or on the screen's outermost element. Surfaces set their own colour through Mantine (`Card`, `Paper`); nothing else colours the page.

## A Surface Has a Border and the Smallest Shadow

- **Type**: MUST
- **Reason**: On a white page the border gives the edge, and the shadow lifts the surface off the page, which a border alone cannot do. Larger shadows make cards look like dialogs, which spends the cue that `Overlay` needs.

### Details

```typescript
// Good
<Card padding="md" shadow="xs" withBorder>

// Bad: no lift, the card is a box drawn on the page
<Card padding="md" withBorder>

// Bad: an in-flow card shadowed like a dialog
<Card padding="md" shadow="lg" withBorder>
```

An in-flow surface never takes a shadow above `xs`, except the embedded content frame below.

## Inside a Surface, Separate with Fill, Not with Another Shadow

- **Type**: MUST NOT
- **Reason**: A shadowed card inside a shadowed card claims a fourth layer the map does not have, and the inner card competes with the outer one for being the container.

### Details

A group inside a surface uses `Paper withBorder` with no shadow, or a `gray.0` fill with no border. One shadow per stack.

```typescript
// Good
<Card padding="md" shadow="xs" withBorder>
  <Paper bg="gray.0" p="md">

// Bad
<Card padding="md" shadow="xs" withBorder>
  <Card padding="md" shadow="xs" withBorder>
```

## A Chat Message Is Not a Surface

- **Type**: MUST
- **Reason**: A conversation sits inside a surface, next to other bordered boxes. A message drawn as one more bordered box reads as another card, and the reader cannot tell the assistant's words from the content they are about.

### Details

Neither speaker's message takes a border or a shadow. The user's message is a bubble: the accent's light colour (`--mantine-primary-color-light`), at the right, with three corners rounded `lg` and the top-right corner `xs`. The assistant's message is plain text with no fill, because its replies run long and carry headings and lists; a leading `IconSparkles` in the accent marks where each message starts, so it does not run into the surrounding copy. Draw messages through one shared component in `src/shared-components/`, so every conversation separates its speakers the same way.

## Embedded Content Is a Separate Object Placed on the Page

- **Type**: MUST
- **Reason**: A preview or mock in an `iframe` is another application. When it renders on the same white as the management screen, the reader cannot tell where the management controls end and the previewed screen begins, and clicks a previewed button believing it acts on the management screen.

### Details

An embedded application gets a frame that reads like a browser window: a chrome bar on top and the content below.

| Part            | Treatment                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Frame           | Border, `radius="md"`, `shadow="md"`, clipped (`overflow: hidden`)                                               |
| Chrome bar      | `gray.1` fill, a bottom border, height of one toolbar row                                                        |
| Chrome contents | What is shown — the application name, the path, the version — and the frame's own controls (reload, full screen) |
| Screen list     | Optional. A panel at the left inside the frame that picks which screen the viewport shows                        |
| Viewport        | The `iframe` alone, with no padding, so its edge is the frame's edge                                             |

The screen list is part of the frame, not of the management screen: it changes only what the viewport shows, so it stays inside the frame, and it goes full screen with the frame.

The frame sits on the page, never inside a `Card`. Its `shadow="md"` is the one exception to the in-flow `xs` limit: the frame holds a different application, and the extra lift is what says so.

```text
// Good: the chrome bar names what is inside, and the frame floats on the page
┌────────────────────────────────────────┐
│ ▤ 在庫管理  /orders   v3         ⟳ ⛶  │  ← chrome, gray.1
├────────────┬───────────────────────────┤
│ 画面一覧   │                           │
│ 注文の一覧 │  previewed application    │  ← screen list | iframe
│ 注文の詳細 │                           │
└────────────┴───────────────────────────┘  ← shadow md

// Bad: the preview is a bordered box inside a card, on the same white as the controls above it
┌──────────────────────────────────────┐
│ 確認する画面            [承認する]    │
│ ┌──────────────────────────────────┐ │
│ │ previewed application [保存]     │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Controls that act on the previewed application belong in the chrome. Controls that act on the management screen — approving, requesting a change — sit outside the frame, on the page or in a surface beside it.

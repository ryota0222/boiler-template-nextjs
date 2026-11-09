---
description: Which layout and which screen recipe to start a screen from, and which blocks each recipe is built from
paths:
  [
    'src/app/**/*.tsx',
    'src/features/**/*.tsx',
    'src/shared-components/**/*.tsx',
    'packages/ui/src/blocks/**/*.tsx',
  ]
---

# Screen Recipes

A recipe is a screen shape this template has already built and checked: a layout, the blocks inside it, and the states it must have. Start every screen from the recipe that matches what the user does there, then change what the product needs. The drawn version of every recipe is the `Recipes` page of the Figma file `Mantine UI（テンプレート）`.

This file decides which recipe to start from. It does not repeat the rules the recipes follow: the list, detail, and edit chain is `design-ooui.md`, where an answer is shown is `design-feedback.md`, required states are `design-states.md`, and the blocks themselves are `ui-blocks.md`.

## The Layout Is Decided Once per App

- **Type**: MUST
- **Reason**: Moving between two layouts inside one app makes the reader relearn where the menu and the account are.

| The app                                                                                   | Layout                                      |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| Six or more destinations, or destinations that fall into groups; used at a desk for hours | `AppShellLayout` with `NavigationLinks`     |
| Five destinations or fewer, no groups; the content wants the full width                   | `HeaderNavLayout`                           |
| Used on a handheld or with one hand, stepping through work while scanning                 | `HandheldLayout` (every screen of the task) |

Inside the app's layout, two areas may use their own frame: the settings (`SettingsLayout`, when there are three or more groups of settings) and a queue the user works through (`SplitLayout`). Both sit inside the app's layout, never instead of it.

## The Recipe Follows What the User Does on the Screen

- **Type**: MUST
- **Reason**: A screen built from the wrong shape fails in ways no single block shows: a dashboard nobody acts on, a list where the user only ever needs one record.

| What the user does on the screen                                    | Recipe     | Built from                                                                                                                              |
| ------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Finds and picks one among many                                      | Collection | `PageHeader`, filters (`TextInput`, `DateRangeFilter`, `NativeSelect`), `DataTable` with `StatusBadge` and `RelativeTime`, `Pagination` |
| Checks one object, or changes one or two of its values              | Detail     | `PageHeader`, `DetailCard`, `InlineEdit`, `CopyableValue`, `ActivityTimeline`                                                           |
| Creates an object, or changes many values that depend on each other | Form       | `FormCard`, `FieldLabel`, `required`, `FileDropzone`, `ConfirmModal` for a destructive submit                                           |
| Works through many objects one after another (approve, sort)        | Split      | `SplitLayout`: the collection on the left, the detail on the right                                                                      |
| Sees today's numbers and what to do next                            | Dashboard  | `StatsGrid` with `MetricValue`, `SegmentedProgress`, `ActivityTimeline`                                                                 |
| Asks the AI or hands it a job                                       | Chat       | `ChatMessage`, `ThinkingIndicator`, `ChatComposer`                                                                                      |
| Handles physical items one by one                                   | Task step  | `HandheldLayout`, a scan prompt, `ResultCard`, `MetricValue`, one fixed primary button                                                  |
| Changes their own or the app's settings                             | Settings   | `SettingsLayout` (three or more groups), `InlineEdit`, `Checkbox`, a subtle red destructive action at the end                           |

When a value on a detail screen needs more than a single field to change, or changing it affects other values, send the user to the form instead of growing `InlineEdit`. A create with five inputs or fewer may be a modal (`design-feedback.md`).

## Each Recipe Has Its Required States

- **Type**: MUST

| Recipe     | States it must draw                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Collection | Ideal, Empty (and Empty after filtering), Loading (`CollectionSkeleton`), Error                      |
| Detail     | Ideal, Loading, Error, Not Found; `InlineEdit` saving and failure                                    |
| Form       | Ideal, filled with an enabled submit, input error, submit failure                                    |
| Split      | Nothing selected, selected, the selected item gone                                                   |
| Dashboard  | Ideal, Loading per card, a card with no data                                                         |
| Chat       | No messages yet, the AI writing, a failed reply                                                      |
| Task step  | Waiting for a scan, `ResultCard` pending / success / failure, offline (`OfflineBanner` and the band) |
| Settings   | Ideal, `InlineEdit` saving and failure                                                               |

## A Dashboard Earns Its Place

- **Type**: SHOULD
- **Reason**: Numbers nobody acts on are decoration, and a dashboard is the first thing a model reaches for when it does not know what the user does.

Every card on a dashboard either links to the screen where the user acts on what it shows, or answers a question the users said they ask daily. Without that, start the app on the collection the user works in.

## The Task Step Is the One Process-Shaped Recipe

- **Type**: MUST
- **Reason**: `design-ooui.md` warns against shaping screens around a process. Handheld work is the exception: the user's hands are on the items, and the order is set by the physical work, not by the interface.

Use the task-step recipe only on `HandheldLayout`. At a desk, the same work is a collection and a detail.

## A Screen That Fits No Recipe

- **Type**: SHOULD

Start from the closest recipe, and record in the requirements what differs and why. When the same new shape is needed a second time, draw it on the Figma `Recipes` page and add its row here before building it again.

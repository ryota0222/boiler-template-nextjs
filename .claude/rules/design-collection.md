---
description: Rules for searching, sorting, paging, and acting in bulk on a collection view
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx']
---

# Collection Views

`design-ooui.md` establishes that most objects need a collection view. This file says how that
view behaves once it holds real volume. Every rule here assumes the list is long enough to need
it — a list that fits on one screen still gets the same controls, because it will not stay short.

Where the search row sits relative to the header and the table is `design-layout.md`.

## Applied Conditions Are Always Visible

- **Type**: MUST
- **Reason**: A filter the user forgot they set turns an empty result into a bug report. The
  condition must be visible without opening anything.

Render the active conditions as removable chips under the search row, plus one control that
clears all of them. Each chip names the field and the value.

The search field itself states its scope in the placeholder — the user should not have to guess
which columns it matches.

```text
検索  [注文番号・顧客名・担当者        ]  部分一致で絞り込みます
適用中の条件  [検索: 田中 ×] [状態: 未発送 ×]  条件をすべて解除
```

Search is partial-match and case-insensitive over the identifier and name columns.

## Sorting Is on the Column Header

- **Type**: MUST

Clicking a column header sorts ascending, clicking again descends. The sorted column carries
`aria-sort` and an arrow; unsorted columns carry a neutral affordance so the user knows they can
be clicked. Nulls sort last in both directions.

`design-a11y.md` owns the `aria-sort` requirement; this rule owns the interaction it describes.

## Pagination Is Fixed at 20 / 50 / 100

- **Type**: MUST
- **Reason**: An unbounded list hides both the scroll cost and the total, and the total is what
  tells the user whether their filter did what they meant.

20 rows by default. A size selector offering 20 / 50 / 100. Alongside it, the visible range and
the total: `1〜20件を表示　全26件`.

An infinite scroll replaces the total with nothing, so it needs a reason. Treat it as a decision,
not a default.

## Bulk Actions State the Count Before They Run

- **Type**: MUST
- **Reason**: The damage from a bulk action scales with the selection, so the selection size is
  the one fact the user must see before confirming.

Row checkboxes plus a select-all for the visible page. While anything is selected, a bar names
the count and offers the actions: `3件を選択中  [選択を解除] [選択した3件の注文を発送]`.
The confirmation dialog repeats the count and lists the rows (`design-feedback.md`).

Rows that cannot take the action get a disabled checkbox, and the header says why in one line.

## Selecting a Row Must Not Redraw the List

- **Type**: MUST NOT
- **Reason**: Redrawing destroys the checkbox the user is on, so keyboard selection loses its
  place and rapid clicking drops selections.

Update the row's `aria-selected`, the bulk bar, and the header emphasis in place. Only a change
of filter, sort, page, or page size redraws the table.

Selection is client UI state local to the collection component, so it belongs in `useState` rather
than in a store — see `state-management.md`.

## Every Column Earns Its Width

- **Type**: MUST
- **Reason**: A table wide enough to scroll horizontally is read by scrolling, which loses the
  row's identity.

Put the columns the user scans first — the object's name, its state, its amount. Push provenance
and internal identifiers to the single-object screen. When the table still overflows, the scroll
container is the table, never the page (`design-states.md`, many-items condition).

Amounts and dates are right-aligned with tabular figures; state is a `Badge`
(`design-affordance.md`); the object's name is the row's link.

## File Output Sits Between the Filters and the Table

- **Type**: MUST
- **Reason**: An export acts on the filtered set, so it belongs after the controls that decide
  that set and before the result it describes.

The export control states what it will write — the range, the row count, and that the current
filter applies. A retreat path out of the system (a spreadsheet export of the whole collection) is
a feature, not a debug aid; give it the same care as the rest of the screen.

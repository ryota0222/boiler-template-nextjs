---
description: Rules for object-first screen design (OOUI) in App Router pages and feature components
paths: ['src/app/**/*.tsx', 'src/features/**/*.tsx']
---

# Object-First Screen Design

## The Principle

Users select an object, then act on it. The reverse order — select a task, then supply its target — forces the user to hold the system's internal process in their head.

This is the screen-level form of the rule `coding-standards.md` already applies to filenames: name the concept, not the operation. Applied to labels it becomes the noun rule in `design-copy.md`. All three are the same constraint at different layers.

## Every Screen Names Its Object

Before adding a page or feature, name the object it operates on and point at the type in `entities/` that defines it. If no type can be named, the screen is task-oriented — redesign it before writing code.

```text
// Good: the object exists as a type, and the views are named after it
src/entities/order/order.ts
src/features/order-list/OrderList.tsx
src/features/order-detail/OrderDetail.tsx

// Bad: named after a procedure, with no object behind it
src/features/order-registration-wizard/OrderRegistrationWizard.tsx
```

## Collection View and Single View

Most objects need both, and App Router maps them onto routes:

| View       | Content                                 | Route               |
| ---------- | --------------------------------------- | ------------------- |
| Collection | Every instance, filterable and sortable | `/orders`           |
| Single     | One instance in full, with its actions  | `/orders/[orderID]` |

A feature that has only a single view and no way to browse instances is usually missing its entry point. How the collection behaves once it holds real volume is `design-collection.md`.

### The Three Screens Are List, Detail, and Edit

- **Type**: MUST
- **Reason**: A user who learns the shape once can predict where an action lives for every object in the system. Mixing a modal into that chain for one object breaks the prediction for all of them.

List → detail → edit, as pages. Within one feature, do not implement the same job as a modal on one screen and a page on another. When a modal is justified at all, `design-feedback.md` says under which conditions.

### A Child Segment May Name a View of the Parent Object

The rule above asks every screen to name its object. A child segment satisfies it through its parent: the object is the parent segment, and the child names one view of that object. `/r/[workspace]/[room]/settings` and `/r/[workspace]/[room]/present` are both views of one room, so neither needs an entity of its own.

This holds only while the child is a view. A child that introduces a second object, or that is named after a procedure rather than a view, is the case the rule forbids.

```text
// Good: one object, three views
/r/[workspace]/[room]
/r/[workspace]/[room]/present
/r/[workspace]/[room]/settings

// Bad: named after a procedure, and the object is no longer the room
/r/[workspace]/[room]/start-estimation-wizard
```

## Actions Follow Selection

Actions belong to the object and appear once it is selected. An action must not be the entry point that then asks what to act on.

```typescript
// Good: the action lives on the collection or the selected object
<OrderList>
  <Button>注文を追加</Button>
</OrderList>

// Bad: a global navigation entry that opens a wizard asking for a target
<nav><Link href="/order-registration">注文登録</Link></nav>
```

Navigation entries stay nouns; buttons carry the verb. See `design-copy.md`.

## Wizards Are a Warning Sign

A multi-step wizard usually means the interface was designed around a process rather than an object. Before building one, check whether the user can instead create the object first and edit its properties in place.

Genuine exceptions exist where ordering is transactional or legal — checkout and payment flows are the common case. Treat a wizard as a decision that needs a reason, not a default.

A numbered sequence on one page is not a wizard, and it is the right shape when a later step is constrained by an earlier one. Keep the steps to the ones that carry a real decision: if a step's answer is derivable from the data, delete the step (`design-form.md`).

## The Menu Names Objects, Not Tasks

- **Type**: MUST
- **Reason**: The menu is the system's object model made visible. A menu of tasks tells the user what the system does; a menu of objects tells them where their work lives.

- Two levels at most, three as the absolute ceiling. The first level groups; the second level is the objects.
- The label, the route, the page title, and the breadcrumb root are the same string. When they drift, either the object was renamed halfway through or two objects were conflated. This is the table below, seen from the user's side.
- Name the collection after what it contains, not after its most common member. A collection that holds two kinds of record takes the noun that covers both.
- Prefer the term the business already uses, unless that term is ambiguous inside the system. Where the ambiguity is a spelling variant rather than a meaning, `prh.yml` settles it (`design-copy.md`).

## The Object Keeps One Name Across Every Layer

| Layer            | Name                           |
| ---------------- | ------------------------------ |
| `entities/`      | `order.ts`                     |
| `features/`      | `order-list/`, `order-detail/` |
| Route            | `/orders`, `/orders/[orderID]` |
| Navigation label | `注文`                         |

A mismatch in this table means either the object was renamed halfway through or two objects were conflated into one screen. Check it whenever a feature is added.

## Navigation Icons Are Chosen From the Work, Not the Word

- **Type**: MUST

Pick a glyph the user could guess from what the object is, not from the letters of its label. Never repeat one glyph for two objects. The icon set itself is fixed by `design-layout.md`.

## Hiding a Menu Entry and Removing It Are Different

- **Type**: MUST
- **Reason**: A screen that is hidden still exists and can be reached by URL. Treating the two as one leaves a route with no access control.

Define them separately: hidden means the entry is not rendered but the route resolves; removed means the route does not resolve. When both could apply, removal wins. Decide which one applies before the first conditional entry is built, so it does not invent its own semantics.

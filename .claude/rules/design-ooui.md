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

A feature that has only a single view and no way to browse instances is usually missing its entry point.

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

## The Object Keeps One Name Across Every Layer

| Layer            | Name                           |
| ---------------- | ------------------------------ |
| `entities/`      | `order.ts`                     |
| `features/`      | `order-list/`, `order-detail/` |
| Route            | `/orders`, `/orders/[orderID]` |
| Navigation label | `注文`                         |

A mismatch in this table means either the object was renamed halfway through or two objects were conflated into one screen. Check it whenever a feature is added.

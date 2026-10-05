---
description: Rules for presenter definitions in src/presenters/
paths: ['src/presenters/**/*.ts']
---

# Presenter Rules

## What is a Presenter

Presenters turn the result of a usecase into an HTTP `Response`: they decide the status code, the JSON body shape, and any headers.

## Structure

Each presenter is a single file named `<concept>Presenter.ts` (camelCase), placed directly under `src/presenters/`. It exports functions that take domain entity types and return a `Response`. `apiResponsePresenter.ts` maps every `ApiFailure` kind to its status and serves every endpoint.

```typescript
export const presentFailure = (failure: ApiFailure): Response =>
  Response.json({ error: failure } satisfies FailureResponseBody, {
    status: statusByFailureKind[failure.kind],
  });
```

## Interface Types

Presenter interface types are defined in `src/usecases/<concept>/presenters/`, not in presenter implementation files.

## Server Responses Only

Presenters format what the API returns. Formatting data for display in the browser belongs to `src/features/` (ViewModels in `internal/`, `features.md`), not here — presenters run on the server and the UI layers must not import them. dependency-cruiser enforces this.

## No Business Logic

Presenters contain only:

- Status code, header, and body shape decisions
- Conversion from domain entity types to the response body

No I/O, no domain rules, no orchestration.

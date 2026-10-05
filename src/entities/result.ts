export type Result<T, E = Error> =
  { readonly error: E; readonly ok: false } | { readonly ok: true; readonly value: T };

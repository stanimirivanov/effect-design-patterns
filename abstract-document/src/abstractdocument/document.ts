import { Option, Stream, pipe } from "effect"

/**
 * A document stores arbitrary properties and provides a small set of
 * operations for retrieving values, updating the document and traversing
 * child documents.
 *
 * The API is immutable. Calling `put()` returns a new `Document` while the
 * original instance remains unchanged.
 *
 * Effect's `Option` models optional values without using `null`, and
 * `Stream` provides lazy access to child documents.
 */
export interface Document {
  readonly properties: Readonly<Record<string, unknown>>
  readonly get: (key: string) => Option.Option<unknown>
  readonly put: (key: string, value: unknown) => Document
  readonly children: <T>(
    key: string,
    constructor: (properties: Record<string, unknown>) => T
  ) => Stream.Stream<T>
  readonly toString: () => string
}

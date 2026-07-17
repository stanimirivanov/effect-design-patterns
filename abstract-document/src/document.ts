import { Option, Stream, pipe } from "effect"

/**
 * Document is the structural equivalent of the Java `Document` interface +
 * `AbstractDocument` base class combined into one. Java splits these because
 * an interface can't hold state; a plain object with closures doesn't need
 * that split.
 *
 * Two deliberate differences from the Java original, flagged here and in
 * the pattern README:
 *
 * 1. `get` returns `Option<unknown>` directly, not a nullable `Object`. In
 *    Java only the typed trait getters (HasType, HasModel, ...) wrap the
 *    result in `Optional`; the base `Document.get` returns a raw nullable
 *    reference. Here the base method itself returns `Option`, since
 *    "absence" is modeled with `Option` throughout this codebase rather
 *    than at just the typed boundary.
 *
 * 2. `put` is immutable: it returns a *new* Document with the key set,
 *    instead of mutating the underlying map and returning `Void`. This is
 *    a genuine behavior change, not just a syntax swap - see
 *    `test/document.test.ts` ("should update existing value") for a test
 *    that demonstrates the original object is left untouched.
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

const toDebugString = (properties: Readonly<Record<string, unknown>>): string => {
  const entries = Object.entries(properties)
    .map(([key, value]) => `[${key} : ${value}]`)
    .join(", ")
  return `Document[${entries}]`
}

/**
 * Constructs a Document over an immutable property bag.
 *
 * Java's `AbstractDocument` constructor fails fast via
 * `Objects.requireNonNull`. TypeScript's type system already forbids
 * passing `null`/`undefined` at compile time, but since that guarantee
 * disappears at runtime (e.g. data from JSON.parse, or a caller ignoring
 * types with `as any`), the same runtime check is kept here for parity.
 */
export const make = (properties: Readonly<Record<string, unknown>>): Document => {
  if (properties == null) {
    throw new Error("properties map is required")
  }

  const get = (key: string): Option.Option<unknown> => Option.fromNullable(properties[key])

  const put = (key: string, value: unknown): Document => make({ ...properties, [key]: value })

  const children = <T>(
    key: string,
    constructor: (properties: Record<string, unknown>) => T
  ): Stream.Stream<T> =>
    pipe(
      get(key),
      Option.match({
        onNone: () => Stream.empty,
        onSome: (value) =>
          Array.isArray(value)
            ? pipe(
                Stream.fromIterable(value as ReadonlyArray<Record<string, unknown>>),
                Stream.map(constructor)
              )
            : Stream.empty
      })
    )

  return {
    properties,
    get,
    put,
    children,
    toString: () => toDebugString(properties)
  }
}

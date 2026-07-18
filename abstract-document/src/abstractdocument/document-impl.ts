import { Option, Stream, pipe } from "effect"
import type { Document } from "./document"

/**
 * Constructs a Document over an immutable property bag.
 *
 * Java's `AbstractDocument` constructor fails fast via
 * `Objects.requireNonNull`. TypeScript's type system already forbids
 * passing `null`/`undefined` at compile time, but since that guarantee
 * disappears at runtime (e.g. data from JSON.parse, or a caller ignoring
 * types with `as any`), the same runtime check is kept here for parity.
 */
export const makeDocument = (properties: Readonly<Record<string, unknown>>): Document => {
  if (properties == null) {
    throw new Error("properties map is required")
  }

  const get = (key: string): Option.Option<unknown> => Option.fromNullable(properties[key])

  const put = (key: string, value: unknown): Document => makeDocument({ ...properties, [key]: value })

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

const toDebugString = (properties: Readonly<Record<string, unknown>>): string => {
  const entries = Object.entries(properties)
    .map(([key, value]) => `[${key} : ${value}]`)
    .join(", ")
  return `Document[${entries}]`
}

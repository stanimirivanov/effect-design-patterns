import { Option, Stream, pipe } from "effect"
import type { Document } from "./document"

/**
 * Creates the default immutable implementation of `Document`.
 *
 * Properties are stored in a readonly map. Updating a property creates a
 * new document with the modified property set while leaving the original
 * document unchanged.
 */
export const makeDocument = (properties: Readonly<Record<string, unknown>>): Document => {
  if (properties == null) {
    throw new Error("properties map is required")
  }

  const get = (key: string): Option.Option<unknown> => Option.fromNullable(properties[key])

  const put = (key: string, value: unknown): Document => makeDocument({ ...properties, [key]: value })

  /**
   * Converts the property value into a lazy `Stream` of child documents.
   *
   * `Option.match` selects between two branches depending on whether the
   * property exists. `Stream.fromIterable` lazily emits each child, while
   * `Stream.map` constructs the requested document type.
   */
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

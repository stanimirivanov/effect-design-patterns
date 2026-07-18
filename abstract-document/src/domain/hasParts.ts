import type { Stream } from "effect"
import type { Document } from "@abstractdocument/document"
import { Property } from "./property"
import { makePart, type Part } from "./part"

/**
 * Java: `Stream<Part> getParts() { return children(Property.PARTS...,
 * Part::new); }` - `java.util.stream.Stream` is a pull-based, lazy
 * sequence you consume once. Effect's `Stream` module is the same idea
 * scaled up (it also supports async steps, backpressure, resource-safe
 * acquisition, retries...), so it's a close conceptual match even though
 * this particular usage only needs the synchronous, in-memory subset of
 * what Effect's Stream can do.
 */
export interface HasParts {
  readonly getParts: () => Stream.Stream<Part>
}

export const hasParts = <T extends Document>(document: T): T & HasParts => ({
  ...document,
  getParts: () => document.children(Property.PARTS, makePart)
})

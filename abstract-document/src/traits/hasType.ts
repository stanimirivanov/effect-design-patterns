import { Option, Schema, pipe } from "effect"
import type { Document } from "../document"
import { Property } from "../property"

/**
 * Java's traits are interfaces with *default methods*: `HasType extends
 * Document` and ships a working `getType()` implementation for free, which
 * `Part implements HasType, HasModel, HasPrice` picks up via multiple
 * interface inheritance.
 *
 * TypeScript interfaces can't carry implementations, so there's no direct
 * translation of "default method". The idiomatic FP replacement is a
 * higher-order function that takes a Document and returns a new object
 * with the extra method attached - composed with `pipe` at the call site
 * instead of `implements` at the class declaration. See car.ts/part.ts for
 * the composition; this keeps `car.getModel()` / `part.getType()` working
 * exactly like the Java call sites, just built differently.
 *
 * `Schema.decodeUnknownOption` replaces Java's unchecked cast
 * `(String) get(...)`: instead of a cast that throws `ClassCastException`
 * only if you're unlucky enough to hit it at runtime, decoding into
 * `Option` gives a `None` for anything that isn't actually a string -
 * type safety Java's version doesn't actually have.
 */
export interface HasType {
  readonly getType: () => Option.Option<string>
}

export const hasType = <T extends Document>(document: T): T & HasType => ({
  ...document,
  getType: () => pipe(document.get(Property.TYPE), Option.flatMap(Schema.decodeUnknownOption(Schema.String)))
})

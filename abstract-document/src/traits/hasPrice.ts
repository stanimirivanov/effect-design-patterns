import { Option, Schema, pipe } from "effect"
import type { Document } from "../document"
import { Property } from "../property"

/**
 * Java's HasPrice types its getter as `Optional<Number>` - `Number` being
 * the common supertype of Java's boxed numeric types (Long, Integer,
 * Double, ...), since the sample data uses `100L` (a `Long`). JS/TS has a
 * single `number` type, so `Schema.Number` is a direct, arguably more
 * precise, equivalent - no boxed-type ambiguity to paper over.
 */
export interface HasPrice {
  readonly getPrice: () => Option.Option<number>
}

export const hasPrice = <T extends Document>(document: T): T & HasPrice => ({
  ...document,
  getPrice: () => pipe(document.get(Property.PRICE), Option.flatMap(Schema.decodeUnknownOption(Schema.Number)))
})

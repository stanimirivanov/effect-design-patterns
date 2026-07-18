import { Option, Schema, pipe } from "effect"
import type { Document } from "@abstractdocument/document"
import { Property } from "./property"

/**
 * Adds typed access to the `TYPE` property.
 *
 * Traits are implemented as higher-order functions that extend a
 * `Document` with additional behaviour. Each trait returns a new object
 * exposing one strongly typed accessor while preserving the original
 * `Document` API.
 *
 * `Schema.decodeUnknownOption` safely decodes an unknown runtime value into
 * the requested type. Invalid values produce `Option.none()` instead of
 * throwing an exception.
 */
export interface HasType {
  readonly getType: () => Option.Option<string>
}

export const hasType = <T extends Document>(document: T): T & HasType => ({
  ...document,
  getType: () => pipe(document.get(Property.TYPE), Option.flatMap(Schema.decodeUnknownOption(Schema.String)))
})

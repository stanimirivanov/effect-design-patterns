import { Option, Schema, pipe } from "effect"
import type { Document } from "../document"
import { Property } from "../property"

/** See hasType.ts for the rationale behind this trait-as-function shape. */
export interface HasModel {
  readonly getModel: () => Option.Option<string>
}

export const hasModel = <T extends Document>(document: T): T & HasModel => ({
  ...document,
  getModel: () => pipe(document.get(Property.MODEL), Option.flatMap(Schema.decodeUnknownOption(Schema.String)))
})

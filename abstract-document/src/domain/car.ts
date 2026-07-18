import { pipe } from "effect"
import { type Document } from "@abstractdocument/document"
import { makeDocument } from "@abstractdocument/document-impl"
import { hasModel, type HasModel } from "./hasModel"
import { hasPrice, type HasPrice } from "./hasPrice"
import { hasParts, type HasParts } from "./hasParts"

/**
 * Example document representing a car.
 */
export type Car = Document & HasModel & HasPrice & HasParts

export const makeCar = (properties: Readonly<Record<string, unknown>>): Car =>
  pipe(makeDocument(properties), hasModel, hasPrice, hasParts)

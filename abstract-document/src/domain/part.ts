import { pipe } from "effect"
import { type Document } from "@abstractdocument/document"
import { makeDocument } from "@abstractdocument/document-impl"
import { hasType, type HasType } from "./hasType"
import { hasModel, type HasModel } from "./hasModel"
import { hasPrice, type HasPrice } from "./hasPrice"

/**
 * Example document representing a car part.
 */
export type Part = Document & HasType & HasModel & HasPrice

export const makePart = (properties: Readonly<Record<string, unknown>>): Part =>
  pipe(makeDocument(properties), hasType, hasModel, hasPrice)

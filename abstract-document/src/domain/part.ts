import { pipe } from "effect"
import type { Document, DocumentProperties } from "@abstractdocument/document"
import { makeDocument } from "@abstractdocument/document-impl"
import { hasType, type HasType } from "./hasType"
import { hasModel, type HasModel } from "./hasModel"
import { hasPrice, type HasPrice } from "./hasPrice"

/**
 * Example document representing a car part.
 */
export type Part = Document & HasType & HasModel & HasPrice

export const makePart = (properties: DocumentProperties): Part =>
  pipe(
    makeDocument(properties), 
    hasType, 
    hasModel, 
    hasPrice
  )

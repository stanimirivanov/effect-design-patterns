import { pipe } from "effect"
import { type Document } from "@abstractdocument/document"
import { makeDocument } from "@abstractdocument/document-impl"
import { hasType, type HasType } from "./hasType"
import { hasModel, type HasModel } from "./hasModel"
import { hasPrice, type HasPrice } from "./hasPrice"

/**
 * Java: `class Part extends AbstractDocument implements HasType, HasModel,
 * HasPrice`. The `pipe` chain below is the composition step that stands in
 * for `implements` - each `hasX` call adds one method to the object,
 * mirroring how each interface contributed one default method in Java.
 */
export type Part = Document & HasType & HasModel & HasPrice

export const makePart = (properties: Readonly<Record<string, unknown>>): Part =>
  pipe(makeDocument(properties), hasType, hasModel, hasPrice)

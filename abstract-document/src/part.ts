import { pipe } from "effect"
import { make, type Document } from "./document.js"
import { hasType, type HasType } from "./traits/hasType.js"
import { hasModel, type HasModel } from "./traits/hasModel.js"
import { hasPrice, type HasPrice } from "./traits/hasPrice.js"

/**
 * Java: `class Part extends AbstractDocument implements HasType, HasModel,
 * HasPrice`. The `pipe` chain below is the composition step that stands in
 * for `implements` - each `hasX` call adds one method to the object,
 * mirroring how each interface contributed one default method in Java.
 */
export type Part = Document & HasType & HasModel & HasPrice

export const makePart = (properties: Readonly<Record<string, unknown>>): Part =>
  pipe(make(properties), hasType, hasModel, hasPrice)

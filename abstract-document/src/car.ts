import { pipe } from "effect"
import { make, type Document } from "./document.js"
import { hasModel, type HasModel } from "./traits/hasModel.js"
import { hasPrice, type HasPrice } from "./traits/hasPrice.js"
import { hasParts, type HasParts } from "./traits/hasParts.js"

/** Java: `class Car extends AbstractDocument implements HasModel, HasPrice, HasParts`. */
export type Car = Document & HasModel & HasPrice & HasParts

export const makeCar = (properties: Readonly<Record<string, unknown>>): Car =>
  pipe(make(properties), hasModel, hasPrice, hasParts)

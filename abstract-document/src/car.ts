import { pipe } from "effect"
import { make, type Document } from "./document"
import { hasModel, type HasModel } from "./traits/hasModel"
import { hasPrice, type HasPrice } from "./traits/hasPrice"
import { hasParts, type HasParts } from "./traits/hasParts"

/** Java: `class Car extends AbstractDocument implements HasModel, HasPrice, HasParts`. */
export type Car = Document & HasModel & HasPrice & HasParts

export const makeCar = (properties: Readonly<Record<string, unknown>>): Car =>
  pipe(make(properties), hasModel, hasPrice, hasParts)

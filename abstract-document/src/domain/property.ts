/**
 * Java's `Property` is a real enum (`PARTS, TYPE, PRICE, MODEL`), used via
 * `Property.MODEL.toString()` to get the string key "MODEL".
 *
 * TypeScript's own `enum` keyword produces extra runtime code (a reverse
 * lookup object) that most style guides steer away from, and it isn't part
 * of the Effect ecosystem's idiom. A `const` object + derived union type is
 * the standard replacement: same call-site shape (`Property.MODEL`),
 * string-valued, no runtime overhead beyond a plain object literal.
 */
export const Property = {
  TYPE: "TYPE",
  PRICE: "PRICE",
  MODEL: "MODEL",
  PARTS: "PARTS"
} as const

export type Property = (typeof Property)[keyof typeof Property]

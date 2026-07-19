/**
 * Property keys used by the example domain.
 *
 * A `const` object provides compile-time literal types while avoiding the
 * runtime overhead of TypeScript enums.
 */
export const Property = {
  TYPE: "TYPE",
  PRICE: "PRICE",
  MODEL: "MODEL",
  PARTS: "PARTS"
} as const

export type Property = (typeof Property)[keyof typeof Property]

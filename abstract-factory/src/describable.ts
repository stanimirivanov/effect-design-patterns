/**
 * Java's `Castle`, `King`, and `Army` are three separate interfaces that
 * each happen to declare the exact same method: `String getDescription()`.
 * They're unrelated types in Java - nominal typing means identical shape
 * doesn't imply any relationship. TypeScript's structural typing makes the
 * shared shape explicit instead of coincidental, so it's factored out once
 * here. Castle/King/Army stay distinct as *services* (see castle.ts etc.) -
 * this only shares what they look like, not what they are.
 */
export interface Describable {
  readonly description: string;
}

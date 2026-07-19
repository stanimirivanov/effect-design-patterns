---
title: "Abstract Document Pattern in TypeScript: Simplifying Data Handling with Flexibility"
shortTitle: Abstract Document
category: Structural
language: en
tag:
  - Abstraction
  - Decoupling
  - Dynamic typing
  - Encapsulation
  - Extensibility
  - Immutability
---

> Ported from the [Java original](https://github.com/iluwatar/java-design-patterns/tree/master/abstract-document) to
> TypeScript/[Effect](https://effect.website).
> See [differences from the Java version](#java--typescripteffect-differences) below for what changed and why.

## Intent of Abstract Document Design Pattern

Provide a consistent way to handle hierarchical, loosely-typed data by separating a document's core storage from the
typed "views" used to read it - so new properties can be added dynamically without a rigid, upfront class structure.

## Explanation

Real-world example

> A library system stores physical books, ebooks, and audiobooks in one place. Each format shares some attributes
> (title, author) and has unique ones (page count, file size, duration). Abstract Document lets the system store and read
> any of these without a rigid per-format class hierarchy.

In plain words

> Abstract Document lets you attach properties to an object, and read them back through typed accessors, without the
> object's class needing to know about those properties in advance.

## Programmatic Example

Consider a car built from parts. We don't know in advance which properties a given car or part will have - the whole
point is not needing to.

`Document` holds an immutable property bag and exposes `get`, `put`, and `children`:

```typescript
export interface Document {
    readonly properties: DocumentProperties
    readonly get: (key: string) => Option.Option<unknown>
    readonly put: (key: string, value: unknown) => Document
    readonly children: <T>(
        key: string,
        constructor: ChildConstructor<T>
    ) => Stream.Stream<T>
}
```

Traits are functions that take a `Document` and return it with one more typed accessor attached, composed with `pipe`
instead of `implements`:

```typescript
export const hasModel = <T extends Document>(document: T): T & HasModel => ({
    ...document,
    getModel: () =>
        pipe(document.get(Property.MODEL), Option.flatMap(Schema.decodeUnknownOption(Schema.String)))
})
```

`Car` and `Part` are built by piping a base `Document` through the traits they need:

```typescript
export const makeCar = (properties: DocumentProperties): Car =>
    pipe(make(properties), hasModel, hasPrice, hasParts)

export const makePart = (properties: DocumentProperties): Part =>
    pipe(make(properties), hasType, hasModel, hasPrice)
```

And constructing/using a car:

```typescript
const car = makeCar({
    [Property.MODEL]: "300SL",
    [Property.PRICE]: 10000,
    [Property.PARTS]: [
        {[Property.TYPE]: "wheel", [Property.MODEL]: "15C", [Property.PRICE]: 100},
        {[Property.TYPE]: "door", [Property.MODEL]: "Lambo", [Property.PRICE]: 300}
    ]
})

Option.getOrThrow(car.getModel()) // "300SL"
Option.getOrThrow(car.getPrice()) // 10000
```

Running it (`bun run abstract-document/src/main.ts` from the repo root, or `bun run start` from inside this folder)
produces:

```
timestamp=... level=INFO fiber=#0 message="Constructing parts and car"
timestamp=... level=INFO fiber=#0 message="Here is our car:"
timestamp=... level=INFO fiber=#0 message="-> model: 300SL"
timestamp=... level=INFO fiber=#0 message="-> price: 10000"
timestamp=... level=INFO fiber=#0 message="-> parts: "
timestamp=... level=INFO fiber=#1 message="	wheel/15C/100"
timestamp=... level=INFO fiber=#1 message="	door/Lambo/300"
```

Same information as the Java original's Logback output, different format - see the differences section.

## When to Use the Abstract Document Pattern

* Documents have diverse, evolving attribute structures known only at runtime (CMS content types, file systems, product
  catalogs, config elements).
* You want typed access to specific properties without forcing every document into one rigid shape.
* Decoupling storage from the specific set of fields in use is more valuable than compile-time-checked object shapes.

## Benefits and Trade-offs

Benefits:

* **Flexibility** - accommodates varied document structures and properties.
* **Extensibility** - add new attributes without changing existing code.
* **Maintainability** - storage and typed access are separate concerns.
* **Reusability** - trait functions are reused across any Document-shaped value.

Trade-offs:

* **Indirection** - reading a property goes through `Option`/`Schema` decoding rather than a direct field access.
* **Runtime cost** - each `put` allocates a new object (structural sharing helps, but it's not free); each trait's
  decode has a small runtime cost the Java casts don't pay (until the cast is wrong).

## Java → TypeScript/Effect Differences

| Aspect                             | Java original                                                                                       | This port                                                                                                     | Notes                                                                                                                                                                                                            |
|------------------------------------|-----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Nullable/optional values           | `Optional<T>` used only in trait getters; base `get()` returns raw nullable `Object`                | `Option<T>` used everywhere, including the base `Document.get`                                                | Behavior-adjacent: absence is `Option` from the ground up, not just at the typed boundary                                                                                                                        |
| Lazy child sequences               | `java.util.stream.Stream<T>`                                                                        | `effect/Stream`                                                                                               | Same role; Effect's `Stream` is a superset (async, backpressure, resource-safety) but only the synchronous subset is used here                                                                                   |
| Interface default methods (traits) | `interface HasModel extends Document { default ... }`, picked up via `implements`                   | Standalone functions (`hasModel(doc)`) composed with `pipe`                                                   | TS interfaces can't carry implementations; `pipe`-composition is the FP equivalent of stacking default methods                                                                                                   |
| **`put` mutation**                 | **Mutates the shared property map in place; returns `Void`**                                        | **Returns a new `Document`; original is untouched**                                                           | **Behavior change, not just syntax** - flagged explicitly; see `shouldUpdateExistingValue` in the tests for a test that asserts the original stays unchanged                                                     |
| Typed property access              | Unchecked cast: `(String) get(key)` - throws `ClassCastException` only if actually wrong at runtime | `Schema.decodeUnknownOption(Schema.String)` - returns `None` for a mismatched type instead of throwing        | Strictly safer than the Java version, not just a stylistic swap                                                                                                                                                  |
| Enum                               | `enum Property { PARTS, TYPE, PRICE, MODEL }`                                                       | `const object` + derived union type                                                                           | TS `enum` carries runtime overhead most style guides avoid; this is the standard replacement                                                                                                                     |
| Constructor null-check             | `Objects.requireNonNull(properties)` throws `NullPointerException`                                  | Same runtime check, throws `Error`                                                                            | Kept as a plain synchronous throw rather than an `Effect` failure - the precondition doesn't warrant the ceremony of the error channel                                                                           |
| `main`/logging                     | Imperative `main`, SLF4J/Logback (`07:21:57.391 [main] INFO ...`)                                   | `Effect.gen` + `Effect.logInfo`, run via `Effect.runPromise` (`timestamp=... level=INFO fiber=#0 ...`)        | Same information, different log line format - Effect's structured logger vs. Logback's pattern layout                                                                                                            |
| Build/test                         | Maven module, own `pom.xml` `<dependencies>`, JUnit 5                                               | Bun workspace package, own `package.json`/`tsconfig.json`, `bun:test`                                         | This folder is a self-contained Bun project - `cd abstract-document && bun install && bun test` works with nothing else present, same as this module's `pom.xml` would build standalone within the Maven reactor |
| `toString()`                       | `Object#toString()` override, includes fully-qualified class name                                   | `toString()` as an own property on the returned object (JS still calls it for string coercion), no class name | There's no class here to name; the property list is still there                                                                                                                                                  |

## References

* [Design Patterns: Elements of Reusable Object-Oriented Software](https://amzn.to/3w0pvKI)
* [Abstract Document Pattern (Wikipedia)](https://en.wikipedia.org/wiki/Abstract_Document_Pattern)
* [Dealing with Properties (Martin Fowler)](http://martinfowler.com/apsupp/properties.pdf)
* [Effect documentation](https://effect.website/docs)

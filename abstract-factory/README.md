---
title: "Abstract Factory Pattern in TypeScript: Families of Services via Effect's Context and Layer"
shortTitle: Abstract Factory
category: Creational
language: en
tag:
  - Abstraction
  - Decoupling
  - Dependency Injection
  - Gang of Four
  - Instantiation
---

> Ported from the [Java original](https://github.com/iluwatar/java-design-patterns/tree/master/abstract-factory) to
> TypeScript/[Effect](https://effect.website). This one changes shape more
> than [Abstract Document](../abstract-document/README.md) did -
> see [why](#why-this-changes-shape-more-than-abstract-document-did) below.

## The problem this pattern solves

A kingdom needs a king, a castle, and an army. There are two kinds of kingdom - elf and orc - and the three pieces have
to match: an elf army defending an orc castle isn't a bug exactly, but it's not what anyone wanted either. The code that
assembles a kingdom shouldn't have to know elf-specific or orc-specific details; it should just say "give me a
consistent kingdom" and get one.

That's the whole pattern: **client code depends on a family of related things through an abstraction, and something else
decides, in one place, which concrete family gets used.** Java solves this with an interface (`KingdomFactory`) and one
class per family (`ElfKingdomFactory`, `OrcKingdomFactory`). This port solves the same problem with two Effect
primitives - `Context.Tag` and `Layer` - that turn out to already *be* this pattern, once you see them the right way.

## Why this changes shape more than Abstract Document did

Abstract Document swapped Java idioms for close TypeScript/Effect equivalents (`Optional` → `Option`, `Stream` →
`Stream`) while keeping the same overall shape: a `Document` object, traits attached to it, methods called on it.

Abstract Factory doesn't have as clean a like-for-like swap, because **Effect has a built-in, general-purpose mechanism
for exactly this problem** - "give client code an abstraction; decide the concrete implementation somewhere else, as one
swappable unit." That mechanism is Effect's dependency system (`Context`/`Layer`), and it's not specific to this
pattern; Effect programs use it for config, logging, database connections, anything. So rather than hand-roll a
`KingdomFactory`-shaped object the way Java does, this port reaches for the general mechanism directly. One consequence:
**there's no `KingdomFactory` type anywhere in this codebase.** Its entire job - "a common supertype that different
concrete factories implement" - is already `Layer`'s job. Writing a `KingdomFactory` interface on top would just be
re-describing what `Layer` already provides.

## Effect constructs used here, explained

If you haven't used Effect before, the two constructs doing all the work in this pattern are `Context.Tag` and `Layer`.
Skip this section if you already know them.

**`Context.Tag` declares a dependency.** Think of it as an interface and a lookup key fused into one thing:

```typescript
export class Castle extends Context.Tag("Castle")<Castle, Describable>() {
}
```

This does two jobs at once. As a *type*, `Castle` means "something shaped like `Describable`" - same as a Java
interface. As a *value*, `Castle` is a token that Effect's runtime uses to find the actual implementation when one is
needed, similar to how you might key a `Map<Class<?>, Object>` by a class token in Java, except Effect tracks it in the
type system so mismatches are caught at compile time instead of showing up as a runtime lookup failure.

**Inside an `Effect.gen` block, `yield* Castle` means "give me whatever was registered for this Tag":**

```typescript
const describeKingdom = Effect.gen(function* () {
    const castle = yield* Castle  // "I need a Castle. I don't care which one."
...
})
```

Nothing here says elf or orc. That's deliberate - this is the "client code" side of the pattern, the part that's only
supposed to know about the abstraction.

**`Layer` is a recipe for satisfying one or more Tags** - not the value itself, a *description* of how to produce it:

```typescript
export const ElfKingdomLive: Layer.Layer<Castle | King | Army> = Layer.mergeAll(
    Layer.succeed(Castle, {description: ELF_CASTLE_DESCRIPTION}),
    Layer.succeed(King, {description: ELF_KING_DESCRIPTION}),
    Layer.succeed(Army, {description: ELF_ARMY_DESCRIPTION})
)
```

`Layer.succeed(Tag, value)` is the simplest possible Layer: "when asked for this Tag, hand back exactly this value, no
setup required." `Layer.mergeAll` combines several Layers into one that satisfies all of their Tags together - this is
the line where "elf castle, elf king, and elf army" stops being three separate facts and becomes one bundled, swappable
unit. That bundling is the actual "factory" in Abstract Factory: not a class, a value.

**`Effect.provide` is where a Tag gets connected to a Layer:**

```typescript
Effect.provide(describeKingdom, ElfKingdomLive)
```

This is the moment "family gets chosen." Everything before this point - `describeKingdom`, `Castle`, `King`, `Army` -
has no idea whether it's elf or orc. `Effect.provide` is the single place that decision gets made, exactly like
`FactoryMaker.makeFactory(type)` is the single place Java's version makes it.

**The payoff shows up in the type signature.** `describeKingdom` has type `Effect<void, never, Castle | King | Army>` -
read the third type parameter as "still needs these." After `Effect.provide(describeKingdom, ElfKingdomLive)`, the type
becomes `Effect<void, never, never>` - nothing left unfulfilled. This isn't just documentation: `Effect.runPromise`
won't accept an Effect that still has unmet requirements. TypeScript itself refuses to compile a program that forgot to
provide something a Layer was supposed to cover - Java's version can only catch that kind of mistake at runtime (a
`NullPointerException` from an unconfigured factory, or a Spring context failing to start).

## Programmatic example

`Castle`, `King`, and `Army` are Tags for a shared shape (Java keeps these as three unrelated interfaces that happen to
match; TypeScript's structural typing lets the shared shape be explicit):

```typescript
export interface Describable {
    readonly description: string
}

export class Castle extends Context.Tag("Castle")<Castle, Describable>() {
}

export class King extends Context.Tag("King")<King, Describable>() {
}

export class Army extends Context.Tag("Army")<Army, Describable>() {
}
```

Each family is one merged Layer (shown for elves; orcs are the same shape with different strings):

```typescript
export const ElfKingdomLive: Layer.Layer<Castle | King | Army> = Layer.mergeAll(
    Layer.succeed(Castle, {description: "This is the elven castle!"}),
    Layer.succeed(King, {description: "This is the elven king!"}),
    Layer.succeed(Army, {description: "This is the elven army!"})
)
```

Picking a family at runtime, parameterized the same way Java's `FactoryMaker` is:

```typescript
export const KingdomType = {ELF: "ELF", ORC: "ORC"} as const
export type KingdomType = (typeof KingdomType)[keyof typeof KingdomType]

export const makeFactory = (type: KingdomType): Layer.Layer<Castle | King | Army> =>
    type === KingdomType.ELF ? ElfKingdomLive : OrcKingdomLive
```

And the program, matching `App.run()`:

```typescript
const describeKingdom = Effect.gen(function* () {
    const army = yield* Army
    const castle = yield* Castle
    const king = yield* King
    yield* Effect.logInfo(army.description)
    yield* Effect.logInfo(castle.description)
    yield* Effect.logInfo(king.description)
})

export const createKingdom = (type: KingdomType) => Effect.provide(describeKingdom, makeFactory(type))

export const program = Effect.gen(function* () {
    yield* Effect.logInfo("elf kingdom")
    yield* createKingdom(KingdomType.ELF)
    yield* Effect.logInfo("orc kingdom")
    yield* createKingdom(KingdomType.ORC)
})
```

Running it (`bun run start` from inside this folder) produces the same eight lines of information as the Java original,
in the same order - only the log line format differs
(see [Abstract Document's README](../abstract-document/README.md#java--typescripteffect-differences) for why):

```
timestamp=... level=INFO fiber=#0 message="elf kingdom"
timestamp=... level=INFO fiber=#0 message="This is the elven army!"
timestamp=... level=INFO fiber=#0 message="This is the elven castle!"
timestamp=... level=INFO fiber=#0 message="This is the elven king!"
timestamp=... level=INFO fiber=#0 message="orc kingdom"
timestamp=... level=INFO fiber=#0 message="This is the orc army!"
timestamp=... level=INFO fiber=#0 message="This is the orc castle!"
timestamp=... level=INFO fiber=#0 message="This is the orc king!"
```

## What Effect actually buys you here

Beyond "it's a different way to write the same thing":

* **Tests substitute Layers, not classes.** Every test in `test/factoryMaker.test.ts` provides a specific Layer and
  reads a Tag back out - there's no mock framework, no subclassing, no test-only constructor overload. A test double for
  `King` is just `Layer.succeed(King, { description: "test king" })`. This is the same idea as constructor-injecting a
  mock in Java, minus needing a framework (Mockito, a test-only Spring profile, ...) to wire it in.
* **The compiler enforces completeness.** As shown above, forgetting to provide a Layer a program needs is a type error,
  not a runtime surprise. Java's Abstract Factory gives you a consistent family *if you remember to go through the
  factory*; nothing stops a typo'd `new OrcKing()` slipping into elf-only code. Effect's version can't compile if a
  requirement is left dangling.
* **Layers compose, including across dependencies.** `Layer.mergeAll` here just combines three independent, no-setup
  Layers - but Layers can also depend on *other* Layers (a database Layer built from a config Layer, say), and Effect
  resolves the whole graph once, in dependency order, sharing anything that's shared. None of the three services in this
  pattern need that, so it doesn't show up in this code, but it's the reason `Layer` is worth reaching for even outside
  pattern-matching Abstract Factory specifically - it's Effect's general answer to "how do I wire a program together,"
  not a one-off trick for this pattern.

The honest trade-off: `Context.Tag`/`Layer`/the `R` type parameter are more upfront concepts than "define an interface,
implement it, `new` the class you want." For a family this small, Java's version is arguably easier to read on first
encounter. The payoff is more visible on a program with many more than three dependencies, where manually threading a
`KingdomFactory`-style object through every function that needs it gets tedious in a way that providing Layers at the
edges doesn't.

## When to reach for this pattern

The Java README's list still applies unchanged - swappable product families, client code that shouldn't know concrete
types, product sets that must stay internally consistent. In Effect specifically, reach for `Context.Tag` + `Layer` any
time you'd otherwise pass the same handful of "things this code needs" through a long chain of function parameters. If a
dependency is used in exactly one place and never swapped (test or otherwise), a plain function argument is simpler than
a Tag - the machinery here earns its keep when something is either genuinely swappable (this pattern) or needed in many
unrelated places without wanting to thread it through every call site.

## Java → TypeScript/Effect differences

| Aspect                          | Java original                                                                                | This port                                                                                                                   | Notes                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Abstract factory                | `interface KingdomFactory { createCastle(); createKing(); createArmy(); }`                   | No equivalent type                                                                                                          | `Layer<Castle \| King \| Army>` already is the common shape every concrete family produces - a `KingdomFactory` interface would duplicate it |
| Concrete factory                | `ElfKingdomFactory`/`OrcKingdomFactory` classes, each `new`-ing three objects                | `ElfKingdomLive`/`OrcKingdomLive`, each a merged `Layer`                                                                    | A value instead of a class; nothing is instantiated until something actually asks for `Castle`/`King`/`Army`                                 |
| Family selection                | `FactoryMaker.makeFactory(KingdomType)` returns a `KingdomFactory`                           | `makeFactory(KingdomType)` returns a `Layer`                                                                                | Same role, same signature shape; different thing being handed back                                                                           |
| Result holder                   | Mutable `Kingdom` class with `king`/`castle`/`army` setters, populated by `createKingdom`    | No holder - `describeKingdom` reads `Castle`/`King`/`Army` and acts on them in one pass                                     | There's nothing to store between "create" and "use" once creation and use both happen inside the same `Effect.gen`                           |
| Product interfaces              | Three separate interfaces (`Castle`, `King`, `Army`) that happen to share a method signature | Three separate `Context.Tag`s sharing one `Describable` type                                                                | Java's nominal typing can't express the shared shape without also merging the types; TS's structural typing can                              |
| Consistency guarantee           | By convention - nothing stops manually mixing `new ElfCastle()` with `new OrcKing()`         | Same - by convention. `Layer.mergeAll` bundles a family together, but a caller could still hand-assemble a mismatched Layer | Worth being honest about: neither version makes mixing a *type error*, both rely on going through the factory/Layer                          |
| Failure mode when misconfigured | Runtime (`NullPointerException`, or a DI framework failing at startup)                       | Compile time - `Effect.runPromise` rejects an Effect with unmet requirements before it ever runs                            | See [Effect constructs used here](#effect-constructs-used-here-explained)                                                                    |
| Testing                         | Mockito or hand-written test doubles, wired via constructor injection                        | `Layer.succeed(Tag, testValue)` substituted directly, no framework                                                          | See `test/factoryMaker.test.ts`                                                                                                              |

## References

* [Design Patterns: Elements of Reusable Object-Oriented Software](https://amzn.to/3w0pvKI)
* [Abstract Factory (Refactoring Guru)](https://refactoring.guru/design-patterns/abstract-factory)
* [Effect docs: Managing Services (Context)](https://effect.website/docs/requirements-management/services/)
* [Effect docs: Layers](https://effect.website/docs/requirements-management/layers/)

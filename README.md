# effect-design-patterns

A TypeScript/[Effect](https://effect.website) port of [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns) (MIT licensed), rebuilt pattern by pattern as a [Bun](https://bun.com) project.

Each pattern keeps the same worked example as the Java original (same sample data, same "car built from parts" style scenarios) so the two implementations stay directly comparable. What changes is *how* each pattern is expressed - swapping Java idioms for the closest genuinely-idiomatic Effect equivalent, not a mechanical line-for-line transliteration.

## Porting philosophy

| Java concept | This port | Why |
|---|---|---|
| `Optional<T>` / nullable references | [`Option<T>`](https://effect.website/docs/data-types/option/) | Direct equivalent; used more broadly than Java's `Optional` (see each pattern's README for specifics) |
| `java.util.stream.Stream<T>` | [`Stream`](https://effect.website/docs/stream/introduction/) (`effect/Stream`) | Same "lazy pull-based sequence" role; Effect's version is a strict superset (async, backpressure, resource-safety) |
| Interfaces with default methods (traits/mixins) | Plain functions composed with `pipe` | TS interfaces can't carry implementations; function composition is the FP replacement for stacking default methods |
| Checked/unchecked exceptions as control flow | Effect's typed error channel (`Effect<A, E, R>`), used where a step can genuinely fail as part of normal operation | Not applied indiscriminately - simple precondition checks that Java throws for stay as plain synchronous throws where wrapping them in `Effect` would just be ceremony. Flagged per-pattern where it comes up. |
| Manual/Spring-style dependency injection | Effect's `Context`/`Layer` | Not yet exercised - the first pattern (Abstract Document) doesn't need DI. Will show up once a pattern that actually wires dependencies gets ported. |
| `enum` | `const` object + derived union type | TypeScript's own `enum` keyword has runtime overhead most style guides avoid |
| SLF4J/Logback | `Effect.log*` (`Effect.logInfo`, etc.) | Built into Effect; output is structured key=value rather than Logback's pattern layout, but carries the same information |
| Maven multi-module (`pom.xml` per pattern) | One Bun project, one pattern per top-level directory | Mirrors the original repo's layout (each pattern is its own top-level folder there too) without the overhead of a package-per-pattern workspace. See [Structural decisions](#structural-decisions). |
| JUnit 5 | [`bun:test`](https://bun.com/docs/cli/test) (Jest-compatible API) | Built into Bun, no extra dependency |

Every pattern's own README has a pattern-specific "Java → TypeScript/Effect differences" section for anything above and beyond this general table - particularly any place where the port changes actual *behavior*, not just syntax, gets called out explicitly there.

## Structural decisions

- **One Bun project, not a workspace-per-pattern monorepo.** All patterns share one root `package.json`/`tsconfig.json`/`node_modules`. This is a deliberate simplification for a project that's just getting started; if patterns end up needing genuinely different dependencies, splitting into Bun workspaces later is a mechanical change (move each pattern's `src`/`test` under a package with its own `package.json`, add a root `workspaces` field) rather than a redesign.
- **Pattern folders live at the repo root** (`abstract-document/`, and so on as more get added), matching the original repo's layout, rather than nesting them under a `patterns/` directory that doesn't exist upstream.

## Project structure

```
effect-design-patterns/
├── package.json          # shared deps (effect, typescript) + root scripts
├── tsconfig.json          # strict TS config (Bun's default: ESNext, bundler resolution)
└── abstract-document/
    ├── README.md           # pattern-specific writeup + Java/TS diff table
    ├── src/
    │   ├── document.ts      # core Document type (get/put/children)
    │   ├── property.ts      # Property key constants
    │   ├── part.ts           # Part entity
    │   ├── car.ts            # Car entity
    │   ├── main.ts            # Effect.gen program, mirrors App.java
    │   ├── index.ts            # public barrel export
    │   └── traits/
    │       ├── hasType.ts
    │       ├── hasModel.ts
    │       ├── hasPrice.ts
    │       └── hasParts.ts
    └── test/
        ├── document.test.ts    # mirrors AbstractDocumentTest.java
        ├── domain.test.ts       # mirrors DomainTest.java
        └── main.test.ts          # mirrors AppTest.java
```

## Building and running

Requires [Bun](https://bun.com) 1.x (built and tested against 1.3.14).

Install dependencies (once, from the repo root):

```bash
bun install
```

Type-check everything:

```bash
bun run typecheck
```

Run the full test suite (all patterns):

```bash
bun test
```

Run a single pattern's tests:

```bash
bun test abstract-document
```

Run a pattern's demo program directly:

```bash
bun run abstract-document/src/main.ts
# or, via the root package.json script:
bun run abstract-document
```

Import a pattern's public API from other TypeScript code in this repo:

```typescript
import { makeCar, makePart, Property } from "./abstract-document/src/index.js"
```

## Patterns ported

| Pattern | Status |
|---|---|
| Abstract Document | ✅ ported ([README](./abstract-document/README.md)) |
| Everything else in the [original repo](https://github.com/iluwatar/java-design-patterns) | not yet started |

## Attribution

Original Java implementations, worked examples, and pattern documentation: [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns), MIT licensed. This project is a derivative port, not affiliated with the original maintainers.

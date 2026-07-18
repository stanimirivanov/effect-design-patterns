# effect-design-patterns

A TypeScript/[Effect](https://effect.website) port
of [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns) (MIT licensed), rebuilt pattern by
pattern as a [Bun](https://bun.com) workspace.

Each pattern keeps the same worked example as the Java original (same sample data, same "car built from parts" style
scenarios) so the two implementations stay directly comparable. What changes is *how* each pattern is expressed -
swapping Java idioms for the closest genuinely-idiomatic Effect equivalent, not a mechanical line-for-line
transliteration.

## Porting philosophy

| Java concept                                                     | This port                                                                                                          | Why                                                                                                                                                                                                            |
|------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Optional<T>` / nullable references                              | [`Option<T>`](https://effect.website/docs/data-types/option/)                                                      | Direct equivalent; used more broadly than Java's `Optional` (see each pattern's README for specifics)                                                                                                          |
| `java.util.stream.Stream<T>`                                     | [`Stream`](https://effect.website/docs/stream/introduction/) (`effect/Stream`)                                     | Same "lazy pull-based sequence" role; Effect's version is a strict superset (async, backpressure, resource-safety)                                                                                             |
| Interfaces with default methods (traits/mixins)                  | Plain functions composed with `pipe`                                                                               | TS interfaces can't carry implementations; function composition is the FP replacement for stacking default methods                                                                                             |
| Checked/unchecked exceptions as control flow                     | Effect's typed error channel (`Effect<A, E, R>`), used where a step can genuinely fail as part of normal operation | Not applied indiscriminately - simple precondition checks that Java throws for stay as plain synchronous throws where wrapping them in `Effect` would just be ceremony. Flagged per-pattern where it comes up. |
| Manual/Spring-style dependency injection                         | Effect's `Context`/`Layer`                                                                                         | Not yet exercised - the first pattern (Abstract Document) doesn't need DI. Will show up once a pattern that actually wires dependencies gets ported.                                                           |
| `enum`                                                           | `const` object + derived union type                                                                                | TypeScript's own `enum` keyword has runtime overhead most style guides avoid                                                                                                                                   |
| SLF4J/Logback                                                    | `Effect.log*` (`Effect.logInfo`, etc.)                                                                             | Built into Effect; output is structured key=value rather than Logback's pattern layout, but carries the same information                                                                                       |
| Maven multi-module, each with its own `pom.xml` `<dependencies>` | Bun workspace, each pattern with its own `package.json` `dependencies`                                             | Same relationship as Maven's parent/child POMs: the root orchestrates, each module/pattern declares and owns what it actually needs. See [Structural decisions](#structural-decisions).                        |
| JUnit 5                                                          | [`bun:test`](https://bun.com/docs/cli/test) (Jest-compatible API)                                                  | Built into Bun, no extra dependency                                                                                                                                                                            |

Every pattern's own README has a pattern-specific "Java → TypeScript/Effect differences" section for anything above and
beyond this general table - particularly any place where the port changes actual *behavior*, not just syntax, gets
called out explicitly there.

## Structural decisions

- **Bun workspace, one package per pattern.** The root `package.json` declares
  `"workspaces": ["abstract-document", ...]` and holds no dependencies of its own. Each pattern is a complete,
  independent Bun package: its own `package.json` (own `dependencies`/`devDependencies`), own `tsconfig.json`, own
  scripts. This replaced an earlier single-shared-`package.json` layout - that version worked from the repo root, but
  broke if you opened a pattern's folder on its own (an editor scoped to just `abstract-document/` couldn't resolve
  `effect`, since it only existed in the root's hoisted `node_modules`). Verified empirically: with this workspace
  layout, `bun install` from the root installs each pattern's dependencies *into that pattern's own `node_modules`*
  rather than hoisting to root, and a pattern folder copied out on its own with nothing else - no parent repo, no root
  `package.json` - still runs `bun install && bun test` correctly standalone.
- **Pattern folders live at the repo root** (`abstract-document/`, and so on as more get added), matching the original
  repo's layout, rather than nesting them under a `patterns/` directory that doesn't exist upstream.
- **No shared root `tsconfig.json`.** Each pattern's `tsconfig.json` is self-contained (no `extends` pointing outside
  its own folder), for the same standalone-friendliness reason as the workspace split above. The root's `typecheck`
  script just loops over pattern directories and runs each one's own `bun run typecheck`.

## Project structure

```
effect-design-patterns/
├── package.json           # workspace root: no deps of its own, just orchestration scripts
├── bun.lock                # single lockfile covering the whole workspace
└── abstract-document/
    ├── package.json          # this pattern's own deps (effect) + scripts (start/test/typecheck)
    ├── tsconfig.json          # self-contained strict TS config (ESNext, bundler resolution)
    ├── README.md               # pattern-specific writeup + Java/TS diff table
    ├── src/
    │   ├── document.ts          # core Document type (get/put/children)
    │   ├── property.ts          # Property key constants
    │   ├── part.ts               # Part entity
    │   ├── car.ts                # Car entity
    │   ├── main.ts                # Effect.gen program, mirrors App.java
    │   ├── index.ts                # public barrel export
    │   └── traits/
    │       ├── hasType.ts
    │       ├── hasModel.ts
    │       ├── hasPrice.ts
    │       └── hasParts.ts
    └── test/
        ├── document.test.ts        # mirrors AbstractDocumentTest.java
        ├── domain.test.ts           # mirrors DomainTest.java
        └── main.test.ts              # mirrors AppTest.java
```

## Building and running

Requires [Bun](https://bun.com) 1.x (built and tested against 1.3.14).

### From the repo root

Install every pattern's dependencies (each into its own `node_modules`, via the workspace):

```bash
bun install
```

Type-check every pattern:

```bash
bun run typecheck
```

Run the full test suite (every pattern):

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
```

### Working on a single pattern in isolation

Each pattern folder is a complete, standalone Bun project - open just `abstract-document/` in your editor, or copy it
out on its own, and it works with no reference to anything outside itself:

```bash
cd abstract-document
bun install       # pulls effect + typescript into abstract-document/node_modules
bun run typecheck
bun test
bun run start      # runs src/main.ts
```

Import a pattern's public API from other TypeScript code:

```typescript
import {makeCar, makePart, Property} from "./abstract-document/src/index"
```

## Patterns ported

| Pattern                                                                                  | Status                                              |
|------------------------------------------------------------------------------------------|-----------------------------------------------------|
| Abstract Document                                                                        | ✅ ported ([README](./abstract-document/README.md)) |
| Everything else in the [original repo](https://github.com/iluwatar/java-design-patterns) | not yet started                                     |

## Attribution

Original Java implementations, worked examples, and pattern
documentation: [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns), MIT licensed. This
project is a derivative port, not affiliated with the original maintainers.

# Effect Design Patterns

A collection of classic software design patterns implemented in [TypeScript](https://www.typescriptlang.org/) using the
[Effect](https://effect.website/) library.

The purpose of this repository is not only to demonstrate the design patterns themselves, but also to explore how they
can be expressed using Effect's functional programming model. Each pattern serves as a practical example of applying
Effect's abstractions in realistic code, providing a hands-on way to learn the library beyond isolated examples.

Rather than translating [Java Design Patterns](https://java-design-patterns.com/patterns/) implementations line by line,
each pattern aims to preserve the original intent while adopting idiomatic TypeScript and Effect practices where
appropriate.

## Goals

This repository has three primary goals:

* Learn the Effect library by implementing well-known design patterns.
* Explore how functional programming concepts influence traditional object-oriented patterns.
* Provide small, self-contained examples that demonstrate practical usage of Effect's APIs.

Each implementation focuses on clarity and education rather than production-ready frameworks or exhaustive feature sets.

## Repository Structure

Each design pattern lives in its own independent project.

```text
.
├── pattern-name/
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   └── test/
│
├── package.json
└── tsconfig.json
```

Every pattern contains its own:

* implementation
* tests
* documentation
* package configuration

This allows each project to evolve independently while sharing common tooling from the repository root.

## Learning Effect Through Design Patterns

Each implementation demonstrates one or more Effect abstractions in a practical context.

Examples include:

* **Option** for explicit handling of optional values.
* **Schema** for runtime validation and decoding.
* **Stream** for lazy and composable data processing.
* **Effect** for describing effectful computations.
* **pipe** for readable functional composition.

Rather than introducing these APIs in isolation, the repository demonstrates how they naturally fit into familiar
software design patterns.

## Project Layout

Although every pattern is different, most projects follow a similar structure.

```text
src/
├── pattern-specific implementation
├── domain model
├── example application
└── public exports

test/
├── unit tests
└── integration tests
```

Each project includes an executable example that demonstrates the pattern in action together with tests verifying its
behaviour.

## Running a Pattern

Navigate to a pattern directory:

```bash
cd pattern-name
```

Install dependencies:

```bash
bun install
```

Run the example:

```bash
bun start
```

Run the tests:

```bash
bun test
```

See the individual project's README for implementation details and a discussion of the Effect constructs used by that
pattern.

## Why This Repository?

Many Design Pattern collections demonstrate patterns using traditional object-oriented techniques. This repository
explores a different perspective by combining those same patterns with modern TypeScript and Effect.

The result is an opportunity to compare different implementation styles while learning:

* immutable data structures
* functional composition
* explicit error and absence handling
* runtime type validation
* lazy evaluation
* effectful programming

The repository is intended as a learning resource for developers who are interested in both software design patterns and
the Effect ecosystem.

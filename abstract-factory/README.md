---
title: "Abstract Factory Pattern in TypeScript with Effect"
shortTitle: Abstract Factory
category: Creational
language: en
tag:
  - Abstraction
  - Dependency Injection
  - Effect
  - Gang of Four
  - Layer
  - Context
---

# Abstract Factory Pattern

This project demonstrates the **Abstract Factory** design pattern implemented
with **TypeScript** and the **Effect**
library.

The implementation follows the original Java Design Patterns example while
adopting idiomatic TypeScript and Effect constructs. Rather than creating
concrete factory classes, the implementation uses Effect's dependency injection
system (`Context.Tag` and `Layer`) to model families of related services.

The goal of this project is twofold:

- demonstrate the Abstract Factory pattern in TypeScript;
- showcase practical usage of Effect's dependency injection APIs.

For a complete explanation of the pattern itself, including its motivation,
structure and UML diagrams, refer to the original implementation.

## About the Pattern

The Abstract Factory pattern creates families of related objects without
exposing their concrete implementations to client code.

In this example, a kingdom consists of three related products:

- `Castle`
- `King`
- `Army`

Two compatible product families are provided:

- Elf
- Orc

The application depends only on the abstract services, while the concrete family
is selected in one place.

For a detailed explanation of the pattern itself, see the original Java Design
Patterns project:

https://java-design-patterns.com/patterns/abstract-factory/

## Project Structure

```text
src/
├── abstractfactory/
│   ├── factory-maker.ts
│   └── index.ts
│
├── kingdom/
│   ├── army.ts
│   ├── castle.ts
│   ├── describable.ts
│   ├── elf-kingdom.ts
│   ├── king.ts
│   ├── kingdom-type.ts
│   ├── orc-kingdom.ts
│   └── index.ts
│
├── index.ts
├── program.ts
└── main.ts
```

The project is intentionally divided into two logical parts:

- **abstractfactory** contains the factory selection logic used by the example.
- **kingdom** contains the abstract products and the concrete product families.

`program.ts` demonstrates how the Abstract Factory pattern is implemented using
Effect, while `main.ts` provides the executable entry point.

## Running the Example

Install dependencies:

```bash
bun install
```

Execute the example:

```bash
bun start
```

Run the test suite:

```bash
bun test
```

The program constructs both an elf kingdom and an orc kingdom using different
factory layers while executing exactly the same application logic.

## The Effect Implementation

The Abstract Factory pattern maps naturally onto Effect's dependency injection
model.

Instead of creating factory classes, the implementation models factories as
`Layer`s that construct complete families of services.

Each Effect abstraction has a specific responsibility.

### Context.Tag

Each abstract product is represented as a `Context.Tag`.

```ts
export class Castle extends Context.Tag("Castle")<
    Castle,
    Describable
>() {
}
```

A `Context.Tag` serves two purposes:

- it defines the type of service required by an Effect;
- it acts as the runtime identifier used to retrieve that service.

Inside an `Effect.gen` block, a service is requested simply by yielding the
corresponding tag.

```ts
const castle = yield * Castle
```

The program depends only on the abstract service and remains independent of the
concrete implementation.

### Layer

Concrete factories are represented as Effect `Layer`s.

```ts
export const ElfKingdomFactory =
    Layer.mergeAll(
        ...
    )
```

Each layer provides a complete family of related services.

`Layer.mergeAll()` combines several service implementations into one factory
layer, ensuring that all required services are provided together.

The application chooses between different product families by selecting a
different layer.

### Effect.provide

`Effect.provide()` connects the application with a concrete factory.

```ts
Effect.provide(program, ElfKingdomFactory)
```

This satisfies the program's service requirements without modifying the
application itself.

The same program can therefore execute with completely different implementations
simply by providing a different factory layer.

### Effect.gen

The example application is expressed as an `Effect`.

```ts
const program = Effect.gen(function* () {
...
})
```

`Effect.gen()` uses generator syntax to sequence computations while keeping the
code readable and composable.

Services are retrieved using `yield*`, making dependency access explicit while
avoiding manual dependency passing throughout the application.

## Why Effect?

Although the Abstract Factory pattern can be implemented using traditional
factory classes, Effect provides a more general dependency injection model.

Using Effect throughout the implementation provides several benefits:

- factories become composable `Layer`s;
- dependencies remain explicit and type-safe;
- services can be substituted without changing application code;
- the compiler verifies that every required dependency has been provided;
- test implementations are created by providing alternative layers.

Rather than being specific to the Abstract Factory pattern, the same
abstractions are used consistently throughout Effect applications.

## Example Output

Running the example produces output similar to the following:

```text
elf kingdom
This is the elven army!
This is the elven castle!
This is the elven king!

orc kingdom
This is the orc army!
This is the orc castle!
This is the orc king!
```

## Learn More

- Effect documentation: https://effect.website/
- Original Java Design Patterns
  implementation: https://java-design-patterns.com/patterns/abstract-factory/
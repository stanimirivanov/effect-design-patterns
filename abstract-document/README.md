---
title: "Abstract Document Pattern in TypeScript with Effect"
shortTitle: Abstract Document
category: Structural
language: en
tag:
  - Abstraction
  - Decoupling
  - Effect
  - Option
  - Stream
---

# Abstract Document Pattern

This project demonstrates the **Abstract Document** design pattern implemented
with **TypeScript** and the **Effect**
library.

The implementation follows the original Java Design Patterns example while
adopting idiomatic TypeScript and functional programming techniques. Rather than
using inheritance and mutable objects, the implementation composes immutable
documents with reusable traits and Effect's functional abstractions.

The goal of this project is twofold:

- demonstrate the Abstract Document pattern in TypeScript;
- showcase practical usage of Effect's `Option`, `Stream`, `Schema`, `pipe`, and
  `Effect` APIs.

For a complete explanation of the pattern itself, including its motivation,
structure and UML diagrams, refer to the original implementation.

## About the Pattern

The Abstract Document pattern allows objects to expose strongly typed APIs while
storing their data in a flexible property map. New properties can be introduced
without modifying existing types, making the model highly extensible.

This repository focuses on the TypeScript and Effect implementation of the
pattern. For a detailed description of the pattern itself,
see: [Abstract Document Pattern in Java: Simplifying Data Handling with Flexibility](https://java-design-patterns.com/patterns/abstract-document/)

## Project Structure

```text
src/
├── abstractdocument/
│   ├── document.ts
│   ├── document-impl.ts
│   └── index.ts
│
├── domain/
│   ├── car.ts
│   ├── part.ts
│   ├── property.ts
│   ├── has-model.ts
│   ├── has-parts.ts
│   ├── has-price.ts
│   ├── has-type.ts
│   └── index.ts
│
├── index.ts
├── program.ts
└── main.ts
```

The project is intentionally divided into two logical parts:

- **abstractdocument** contains the generic implementation of the Abstract
  Document pattern.
- **domain** contains the example domain model built on top of the pattern.

`program.ts` and `main.ts` demonstrates how the pattern can be used to construct
and traverse documents.

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

The example constructs a car document containing several child part documents
and demonstrates how traits provide strongly typed access to document
properties.

### Option

A document stores values as `unknown`, and a property may or may not exist.

Instead of returning `null` or `undefined`, document access returns an
`Option<T>`.

```ts
const model = car.getModel()
```

An `Option` has two possible values:

- `Option.some(value)` — the value exists.
- `Option.none()` — the value is absent.

Operations such as `Option.map()` and `Option.flatMap()` transform values only
when they are present, eliminating explicit null checks while making missing
values part of the type system.

### Schema

Document properties are stored as untyped runtime values.

Effect's `Schema` module validates and decodes these values into strongly typed
objects.

```ts
Schema.decodeUnknownOption(Schema.String)
```

attempts to decode an unknown value as a string.

If decoding succeeds, the result is `Option.some(value)`. If the value has an
unexpected type, the result is
`Option.none()`.

This approach avoids unsafe casts while keeping the implementation concise and
type-safe.

### Stream

Child documents are exposed as an Effect `Stream`.

```ts
car.getParts()
```

A `Stream` represents a lazily evaluated sequence of values.

Unlike an array, values are produced only when the stream is consumed. Although
this example processes an in-memory collection, the same API also supports
asynchronous, infinite and resource-backed streams, making the implementation
easily extensible without changing the public API.

### pipe

Effect encourages composing operations using `pipe`.

Instead of nesting function calls

```ts
f(g(h(x)))
```

the same transformation can be written as

```ts
pipe(
    x,
    h,
    g,
    f
)
```

Each transformation receives the result of the previous one, producing code that
reads naturally from top to bottom and scales well as processing pipelines
become more complex.

### Effect

The example application itself is represented as an `Effect`.

```ts
const program = Effect.gen(function* () {
...
})
```

`Effect.gen()` uses generator syntax to sequence computations that may perform
logging, asynchronous work or other effects.

Individual operations are executed using `yield*`, producing code that resembles
synchronous imperative programming while remaining purely functional and
composable.

The application is started using

```ts
Effect.runPromise(program)
```

which executes the Effect and returns a standard JavaScript `Promise`.

## Why Effect?

Although the Abstract Document pattern does not require Effect, the library
provides a consistent set of abstractions that fit naturally with the pattern.

Using Effect throughout the implementation provides several benefits:

- **Explicit handling of optional values** using `Option`.
- **Safe runtime validation** using `Schema`.
- **Lazy traversal of child documents** using `Stream`.
- **Composable data transformations** using `pipe`.
- **Structured effectful programs** using `Effect`.

Using the same library for all of these concerns results in a uniform
programming model, where the same composition techniques are used throughout the
application.

## Example Output

Running the example produces output similar to the following:

```text
Constructing parts and car

Here is our car:
-> model: 300SL
-> price: 10000
-> parts:
   wheel / 15C / 100
   door / Lambo / 300
```

## Learn More

- Effect documentation: https://effect.website/
- Original Java Design Patterns
  implementation: https://java-design-patterns.com/patterns/abstract-document/
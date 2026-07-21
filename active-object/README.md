---
title: "Active Object Pattern in TypeScript with Effect"
shortTitle: Active Object
category: Concurrency
language: en
tag:
  - Asynchronous
  - Concurrency
  - Effect
  - Fiber
  - Queue
---

# Active Object Pattern

This project demonstrates the **Active Object** design pattern implemented with **TypeScript** and the **Effect**
library.

The implementation follows the original Java Design Patterns example while adopting idiomatic TypeScript and Effect
constructs. Rather than using operating system threads and blocking queues, it models active objects using Effect's
lightweight concurrency primitives.

The goal of this project is twofold:

- demonstrate the Active Object pattern in TypeScript;
- showcase practical usage of Effect's concurrency model.

For a complete explanation of the pattern itself, including its motivation, structure and UML diagrams, refer to the
original implementation.

## About the Pattern

The Active Object pattern decouples method invocation from method execution.

Instead of executing work immediately, method calls are converted into requests and placed into a private queue. A
dedicated worker processes those requests asynchronously, allowing callers to continue immediately while preserving
sequential execution inside the object.

In this example every creature owns:

- a private request queue;
- a dedicated worker fiber;
- asynchronous operations such as `eat()` and `roam()`.

For a detailed explanation of the pattern itself, see the original Java Design Patterns project:

https://java-design-patterns.com/patterns/active-object/

---

# Project Structure

```text
src/
├── activeobject/
│   ├── active-creature.ts
│   ├── orc.ts
│   └── index.ts
│
├── index.ts
├── program.ts
└── main.ts
```

The project is intentionally divided into two logical parts:

- **activeobject** contains the implementation of the Active Object pattern.
- **program.ts** demonstrates how multiple active objects execute concurrently.

`main.ts` provides the executable entry point.

---

# Running the Example

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

The program creates several active creatures, submits work to each of them and waits until every submitted request has
completed before shutting the workers down.

---

# The Effect Implementation

The Active Object pattern maps naturally onto several Effect concurrency primitives.

Rather than manually managing operating system threads, the implementation expresses the pattern using composable
Effects.

Each Effect abstraction has a specific responsibility.

## Effect

Every operation in the application is represented as an `Effect`.

```ts
Effect.gen(function* () {
...
})
```

An `Effect` describes work that may be executed later.

Unlike a normal function call, creating an `Effect` does not immediately perform the computation. Effects can be
composed, combined and executed by the Effect runtime.

The implementation uses `Effect.gen()` to express asynchronous workflows using generator syntax. Each `yield*` executes
another Effect while preserving purely functional composition.

---

## Queue

Each active creature owns a private request queue.

```ts
const requestQueue =
    yield * Queue.unbounded<Request>()
```

The queue stores pending work submitted through methods such as `eat()` and `roam()`.

Submitting work simply appends a request to the queue. The caller returns immediately without waiting for execution.

Only the worker fiber removes requests from the queue, ensuring they execute sequentially.

---

## Fiber

Each creature starts a dedicated worker fiber.

```ts
const worker =
    yield * Effect.fork(processRequests)
```

A fiber is Effect's lightweight unit of concurrency.

Unlike operating system threads, fibers are managed entirely by the Effect runtime, making them inexpensive to create
and schedule.

Each worker repeatedly:

1. waits for the next request;
2. removes it from the queue;
3. executes it;
4. waits for the next request.

This worker loop is the core of the Active Object pattern.

---

## Deferred

Each submitted request creates a `Deferred`.

```ts
const done =
    yield * Deferred.make<void>()
```

A `Deferred` represents work that will complete exactly once in the future.

Rather than exposing `Deferred` directly, the implementation wraps it in a `SubmittedTask`.

```ts
interface SubmittedTask {
    readonly wait: Effect.Effect<void>;
}
```

This allows callers to optionally wait until a specific request has completed while hiding the synchronization mechanism
used internally.

---

## Effect.ensuring

Every submitted request is wrapped using `Effect.ensuring()`.

```ts
Effect.ensuring(
    task,
    Deferred.succeed(done, undefined)
)
```

`Effect.ensuring()` guarantees that cleanup executes regardless of whether the task succeeds, fails or is interrupted.

Here it ensures that every submitted task eventually signals completion.

The same combinator is also used when shutting down the application, guaranteeing that every worker fiber is interrupted
even if the program fails.

---

# How the Pattern Maps to Effect

The Active Object pattern consists of several conceptual building blocks.

This implementation represents them using the following Effect abstractions.

| Pattern concept  | Effect implementation                   |
|------------------|-----------------------------------------|
| Active Object    | `ActiveCreature`                        |
| Request          | `Request` (`Effect<void>`)              |
| Activation Queue | `Queue<Request>`                        |
| Scheduler        | `Queue.offer()`                         |
| Worker           | `Fiber`                                 |
| Future           | `SubmittedTask` (`Deferred` internally) |

This mapping demonstrates how traditional concurrency patterns can be expressed using Effect's functional programming
model.

---

# Example Output

Running the example produces output similar to the following:

```text
Orc0 is eating!
Orc1 is eating!
Orc2 is eating!
Orc0 has finished eating!
Orc1 has finished eating!
Orc2 has finished eating!
Orc0 has started to roam in the wastelands.
Orc1 has started to roam in the wastelands.
Orc2 has started to roam in the wastelands.
```

Each creature processes its own requests sequentially while different creatures execute concurrently.

---

# Why Effect?

The Active Object pattern is fundamentally about concurrency.

Effect provides the primitives needed to express the pattern directly without manually coordinating threads,
synchronization and cleanup.

Using Effect throughout the implementation provides several benefits:

- asynchronous operations are represented as composable Effects;
- fibers provide lightweight concurrent execution;
- queues guarantee sequential request processing;
- deterministic synchronization replaces arbitrary delays;
- cleanup is guaranteed through `Effect.ensuring()`;
- all concurrency primitives compose naturally with the rest of the Effect ecosystem.

Rather than being specific to the Active Object pattern, the same abstractions are used consistently throughout Effect
applications.

---

# Learn More

- Effect documentation: https://effect.website/
- Original Java Design Patterns implementation: https://java-design-patterns.com/patterns/active-object/
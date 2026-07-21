import { Effect, Queue, Fiber, Deferred } from 'effect';

/**
 * Unit of work submitted to an active creature.
 *
 * Each method invocation is represented as an Effect and placed into the
 * creature's request queue. The worker fiber executes these requests one
 * at a time in submission order.
 */
type Request = Effect.Effect<void>;

/**
 * Handle representing work that has been accepted by an active creature.
 *
 * Calling `eat()` or `roam()` schedules work immediately. The returned
 * handle allows callers to optionally wait until that specific request
 * has been executed by the worker fiber.
 *
 * This preserves the asynchronous behaviour of the Active Object pattern
 * while providing deterministic synchronization when needed.
 */
export interface SubmittedTask {
  /**
   * Waits until the submitted task has completed.
   */
  readonly wait: Effect.Effect<void>;
}

/**
 * Represents an active object.
 *
 * Each active creature owns a private work queue and a dedicated worker
 * fiber processing submitted tasks sequentially.
 *
 * Clients interact with the creature by enqueueing work rather than
 * executing it directly. This decouples method invocation from execution,
 * which is the defining characteristic of the Active Object pattern.
 *
 * Unlike traditional object-oriented implementations that dedicate a thread
 * to each active object, this implementation uses an Effect fiber. Fibers
 * are lightweight, cooperative execution contexts that allow many active
 * objects to run efficiently without creating operating system threads.
 *
 * The implementation uses:
 *
 * - `Queue` to store pending work;
 * - `Fiber` to process the queue;
 * - `Deferred` to optionally await completion of an individual task.
 */
export interface ActiveCreature {
  readonly name: string;

  /** Enqueues eating. Returns a handle you can optionally wait on - see roam(). */
  readonly eat: () => Effect.Effect<SubmittedTask>;

  /**
   * Enqueues roaming. Returns a `Deferred` that completes once this
   * specific task has actually run on the worker - not just been
   * accepted into the queue. Nothing forces you to wait on it: calling
   * `roam()` and discarding the result is exactly as fire-and-forget as
   * Java's `void roam()`. Waiting is opt-in, not automatic.
   */
  readonly roam: () => Effect.Effect<SubmittedTask>;

  /**
   * Stops the active creature.
   *
   * Interrupting the worker fiber terminates the request-processing loop.
   * Any requests still waiting in the queue will never be executed.
   */
  readonly kill: () => Effect.Effect<void>;
}

/**
 * Creates a new active creature.
 *
 * `Effect.gen()` allows Effect computations to be written using generator
 * syntax. Each `yield*` executes another Effect while preserving purely
 * functional composition.
 *
 * The resulting Effect allocates the creature's queue, starts the worker
 * fiber and returns an object exposing asynchronous operations.
 */
export const makeActiveCreature = (name: string): Effect.Effect<ActiveCreature> =>
  Effect.gen(function* () {
    const requestQueue = yield* Queue.unbounded<Request>();

    /**
     * Worker loop processing submitted requests.
     *
     * `Queue.take()` suspends the fiber until work becomes available.
     * `Effect.forever()` repeats this loop indefinitely, giving each active
     * creature its own long-running request processor.
     *
     * Since only this worker executes queued requests, all operations are
     * processed sequentially even when multiple callers submit work
     * concurrently.
     *
     * The worker repeatedly removes one request from the queue and executes
     * it. This dedicated execution loop is the core of the Active Object
     * pattern.
     */
    const processRequests = Effect.forever(
      Effect.gen(function* () {
        const task = yield* Queue.take(requestQueue);
        yield* task;
      })
    );

    const worker = yield* Effect.fork(processRequests);

    /**
     * Schedules work for execution.
     *
     * Every request follows the same lifecycle:
     *
     * 1. Create a `Deferred` representing completion.
     * 2. Wrap the task so the `Deferred` is completed when execution finishes.
     * 3. Place the wrapped task into the request queue.
     * 4. Return a handle that can later wait for completion.
     *
     * The `Deferred` is an implementation detail and is not exposed through
     * the public API.
     */
    const submit = (task: Request): Effect.Effect<SubmittedTask> =>
      Effect.gen(function* () {
        const done = yield* Deferred.make<void>();

        // `Effect.ensuring` guarantees that the completion signal is emitted
        // regardless of whether the task succeeds, fails or is interrupted.
        yield* Queue.offer(requestQueue, Effect.ensuring(task, Deferred.succeed(done, undefined)));

        const submittedTask: SubmittedTask = {
          wait: Deferred.await(done),
        };

        return submittedTask;
      });

    /**
     * Work executed by the worker when an eat request reaches the front of
     * the queue.
     */
    const eatTask = Effect.gen(function* () {
      yield* Effect.logInfo(`${name} is eating!`);
      yield* Effect.logInfo(`${name} has finished eating!`);
    });

    /**
     * Work executed by the worker when an roam request reaches the front of
     * the queue.
     */
    const roamTask = Effect.logInfo(`${name} has started to roam in the wastelands.`);

    return {
      name,
      eat: () => submit(eatTask),
      roam: () => submit(roamTask),
      kill: () => Effect.asVoid(Fiber.interrupt(worker)),
    };
  });

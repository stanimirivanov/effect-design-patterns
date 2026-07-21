import { Effect } from 'effect';
import { makeOrc } from '@activeobject/orc';
import type { ActiveCreature, SubmittedTask } from '@activeobject/active-creature';

/**
 * Number of active creatures participating in the demonstration.
 */
const NUM_CREATURES = 3;

/**
 * Submits all requests for a single creature.
 *
 * `Effect.all()` combines several independent Effects into one Effect
 * producing both results.
 *
 * Calling `eat()` and `roam()` only schedules work by placing requests
 * into the creature's queue. The returned `SubmittedTask` handles allow
 * the caller to wait until those requests have actually been executed.
 */
const dispatchTasks = (creature: ActiveCreature) => Effect.all([creature.eat(), creature.roam()]);

/**
 * Waits until every submitted request has been processed.
 *
 * Each `SubmittedTask` represents one queued request.
 *
 * Waiting on the handle does not execute the work—it simply suspends
 * until the worker fiber reports that the corresponding request has
 * completed.
 */
const waitForTasks = (submitted: ReadonlyArray<ReadonlyArray<SubmittedTask>>) =>
  Effect.forEach(submitted.flat(), (task) => task.wait, { discard: true });

/**
 * Stops every active creature.
 *
 * `Effect.forEach()` is used again to interrupt every worker fiber,
 * combining the individual shutdown operations into a single Effect.
 */
const stopCreatures = (creatures: ReadonlyArray<ActiveCreature>) =>
  Effect.forEach(creatures, (creature) => creature.kill(), { discard: true });

/**
 * Demonstrates the Active Object pattern using Effect.
 *
 * The program performs four steps:
 *
 * 1. Create several active creatures.
 * 2. Submit work to each creature.
 * 3. Wait until every submitted request has completed.
 * 4. Stop every worker fiber.
 *
 * The application itself never interacts with queues or worker fibers
 * directly. Instead, it invokes asynchronous operations exposed by
 * `ActiveCreature`, while the implementation manages scheduling and
 * execution internally.
 *
 * `Effect.gen()` allows these asynchronous operations to be written using
 * generator syntax, making the control flow read similarly to synchronous
 * code while remaining purely functional.
 */
export const program = Effect.gen(function* () {
  // `Effect.forEach` executes an Effect for every input element and
  // collects the results into a single Effect returning an array.
  //
  // Here it creates several independent active creatures.
  const creatures = yield* Effect.forEach(
    Array.from({ length: NUM_CREATURES }, (_, i) => `Orc${i}`),
    makeOrc
  );

  /**
   * Executes the demonstration.
   *
   * Work is first submitted to every creature before waiting for
   * completion. This allows all requests to be queued immediately while
   * each creature still processes its own requests sequentially.
   *
   * The returned handles provide deterministic synchronization without
   * exposing the internal request queue.
   */
  const executeWork = Effect.gen(function* () {
    const submittedTasks = yield* Effect.forEach(creatures, dispatchTasks);
    yield* waitForTasks(submittedTasks);
  });

  // `Effect.ensuring` registers cleanup that always runs after the main
  // Effect completes, whether it succeeds, fails or is interrupted.
  //
  // It serves the same purpose as a `finally` block in imperative code.
  yield* executeWork.pipe(Effect.ensuring(stopCreatures(creatures)));
});

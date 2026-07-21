import { describe, test, expect } from 'bun:test';
import { Effect, Deferred } from 'effect';
import { makeOrc } from '@activeobject/orc';

describe('ActiveCreature', () => {
  test('executionTest', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const orc = yield* makeOrc('orc1');
        expect(orc.name).toBe('orc1');

        // Java's version calls eat()/roam() and only checks that
        // enqueueing didn't throw - it has no way to confirm the queued
        // work actually ran. This port can, so it does: waiting on the
        // returned Deferred proves the task was picked up and completed,
        // not just accepted into the queue.
        const eaten = yield* orc.eat();
        const roamed = yield* orc.roam();
        yield* Deferred.await(eaten);
        yield* Deferred.await(roamed);

        yield* orc.kill();
      })
    );
  });
});

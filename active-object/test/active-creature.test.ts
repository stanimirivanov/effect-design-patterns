import { describe, test, expect } from 'bun:test';
import { Effect } from 'effect';
import { makeOrc } from '@activeobject/orc';

describe('ActiveCreature', () => {
  test('executionTest', async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const orc = yield* makeOrc('orc1');
        expect(orc.name).toBe('orc1');

        // Wait until both submitted requests have been processed by the worker.
        const eaten = yield* orc.eat();
        const roamed = yield* orc.roam();

        yield* eaten.wait;
        yield* roamed.wait;

        yield* orc.kill();
      })
    );
  });
});

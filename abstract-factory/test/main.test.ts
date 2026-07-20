import { describe, test } from 'bun:test';
import { Effect } from 'effect';
import { program } from '../src/program';

describe('main', () => {
  test('shouldExecuteApplicationWithoutException', async () => {
    await Effect.runPromise(program);
  });
});

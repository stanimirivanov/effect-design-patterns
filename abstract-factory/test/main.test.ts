import { describe, test } from 'bun:test';
import { Effect } from 'effect';
import { program } from '../src/main';

describe('main', () => {
  test('shouldExecuteApplicationWithoutException', async () => {
    await Effect.runPromise(program);
  });
});

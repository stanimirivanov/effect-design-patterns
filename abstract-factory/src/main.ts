import { Effect } from 'effect';
import { Castle } from './castle';
import { King } from './king';
import { Army } from './army';
import { makeFactory, KingdomType } from './factory-maker';

/**
 * This Effect *declares* that it needs Castle, King, and Army without
 * saying where they come from - that's the `Castle | King | Army` sitting
 * in its requirements (`R`) type parameter. Nothing here mentions "elf" or
 * "orc" at all. That absence is the point: this is the client code from
 * the Abstract Factory pattern - it only ever talks to the abstract
 * products.
 */
const describeKingdom = Effect.gen(function* () {
  const army = yield* Army;
  const castle = yield* Castle;
  const king = yield* King;
  yield* Effect.logInfo(army.description);
  yield* Effect.logInfo(castle.description);
  yield* Effect.logInfo(king.description);
});

/**
 * Java: `App.createKingdom(KingdomType)` calls the three factory methods
 * and stashes the results on a mutable `Kingdom` field. `Effect.provide`
 * does the "supply the family" half of that in one step; there's no
 * mutable holder to stash results in, because nothing needs to be stashed
 * - `describeKingdom` reads its dependencies and acts on them in the same
 * pass.
 */
export const createKingdom = (type: KingdomType) => Effect.provide(describeKingdom, makeFactory(type));

export const program = Effect.gen(function* () {
  yield* Effect.logInfo('elf kingdom');
  yield* createKingdom(KingdomType.ELF);

  yield* Effect.logInfo('orc kingdom');
  yield* createKingdom(KingdomType.ORC);
});

if (import.meta.main) {
  Effect.runPromise(program);
}

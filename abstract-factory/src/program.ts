import { Effect } from 'effect';
import { Castle } from '@kingdom/castle';
import { King } from '@kingdom/king';
import { Army } from '@kingdom/army';
import {
  type Kingdom,
  KingdomType,
  makeFactory,
} from '@abstractfactory/factory-maker';

/**
 * Logs the descriptions of all services belonging to the currently selected
 * kingdom.
 *
 * The Effect requires the `Castle`, `King` and `Army` services to be present in
 * the Context.
 */
const describeKingdom = Effect.gen(function* () {
  const army = yield* Army;
  const castle = yield* Castle;
  const king = yield* King;
  yield* Effect.logInfo(army.describe());
  yield* Effect.logInfo(castle.describe());
  yield* Effect.logInfo(king.describe());
});

/**
 * Executes the demonstration using the selected kingdom factory.
 *
 * Providing the factory layer satisfies the application's service dependencies
 * without changing the program itself.
 */
export const createKingdom = (type: Kingdom) =>
  Effect.provide(describeKingdom, makeFactory(type));

/**
 * Example application demonstrating the Abstract Factory pattern.
 *
 * The program depends only on abstract kingdom services. A concrete kingdom
 * implementation is selected by providing the corresponding factory layer,
 * allowing the same application logic to run with different product families.
 *
 * `Effect.gen` sequences Effect operations using generator syntax, resulting in
 * code that reads similarly to synchronous imperative code while remaining
 * purely functional.
 */
export const program = Effect.gen(function* () {
  yield* Effect.logInfo('elf kingdom');
  yield* createKingdom(KingdomType.ELF);

  yield* Effect.logInfo('orc kingdom');
  yield* createKingdom(KingdomType.ORC);
});

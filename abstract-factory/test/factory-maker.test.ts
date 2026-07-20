import { describe, test, expect } from 'bun:test';
import { Context, Effect } from 'effect';
import { type Kingdom, KingdomType, makeFactory } from '@abstractfactory/factory-maker';
import { Castle } from '@kingdom/castle';
import { King } from '@kingdom/king';
import { Army } from '@kingdom/army';

const ELF_CASTLE_DESCRIPTION = 'This is the elven castle!';
const ELF_KING_DESCRIPTION = 'This is the elven king!';
const ELF_ARMY_DESCRIPTION = 'This is the elven army!';

const ORC_CASTLE_DESCRIPTION = 'This is the orc castle!';
const ORC_KING_DESCRIPTION = 'This is the orc king!';
const ORC_ARMY_DESCRIPTION = 'This is the orc army!';

/**
 * Retrieves a service from the current Context.
 */
const get = <A>(tag: Context.Tag<any, A>) =>
  Effect.gen(function* () {
    return yield* tag;
  });

const getCastle = get(Castle);
const getKing = get(King);
const getArmy = get(Army);

const runWith = <A>(effect: Effect.Effect<A, never, Castle | King | Army>, type: Kingdom) =>
  Effect.runPromise(Effect.provide(effect, makeFactory(type)));

/**
 * Integration tests for the Abstract Factory example.
 *
 * Each test provides a different kingdom factory layer and verifies that the application receives the correct service
 * implementations.
 */
describe('factoryMaker', () => {
  test('verifyKingCreation', async () => {
    expect((await runWith(getKing, KingdomType.ELF)).describe()).toBe(ELF_KING_DESCRIPTION);
    expect((await runWith(getKing, KingdomType.ORC)).describe()).toBe(ORC_KING_DESCRIPTION);
  });

  test('verifyCastleCreation', async () => {
    expect((await runWith(getCastle, KingdomType.ELF)).describe()).toBe(ELF_CASTLE_DESCRIPTION);
    expect((await runWith(getCastle, KingdomType.ORC)).describe()).toBe(ORC_CASTLE_DESCRIPTION);
  });

  test('verifyArmyCreation', async () => {
    expect((await runWith(getArmy, KingdomType.ELF)).describe()).toBe(ELF_ARMY_DESCRIPTION);
    expect((await runWith(getArmy, KingdomType.ORC)).describe()).toBe(ORC_ARMY_DESCRIPTION);
  });

  test('verifyElfKingdomCreation', async () => {
    const all = Effect.gen(function* () {
      return { king: yield* King, castle: yield* Castle, army: yield* Army };
    });
    const kingdom = await runWith(all, KingdomType.ELF);
    expect(kingdom.king.describe()).toBe(ELF_KING_DESCRIPTION);
    expect(kingdom.castle.describe()).toBe(ELF_CASTLE_DESCRIPTION);
    expect(kingdom.army.describe()).toBe(ELF_ARMY_DESCRIPTION);
  });

  test('verifyOrcKingdomCreation', async () => {
    const all = Effect.gen(function* () {
      return { king: yield* King, castle: yield* Castle, army: yield* Army };
    });
    const kingdom = await runWith(all, KingdomType.ORC);
    expect(kingdom.king.describe()).toBe(ORC_KING_DESCRIPTION);
    expect(kingdom.castle.describe()).toBe(ORC_CASTLE_DESCRIPTION);
    expect(kingdom.army.describe()).toBe(ORC_ARMY_DESCRIPTION);
  });
});

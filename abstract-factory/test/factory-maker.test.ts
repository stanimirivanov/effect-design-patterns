import { describe, test, expect } from 'bun:test';
import { Effect } from 'effect';
import { Castle } from '../src/castle';
import { King } from '../src/king';
import { Army } from '../src/army';
import { makeFactory, KingdomType } from '../src/factory-maker';
import { ELF_CASTLE_DESCRIPTION, ELF_KING_DESCRIPTION, ELF_ARMY_DESCRIPTION } from '../src/kingdoms/elf-kingdom';
import { ORC_CASTLE_DESCRIPTION, ORC_KING_DESCRIPTION, ORC_ARMY_DESCRIPTION } from '../src/kingdoms/orc-kingdom';

/**
 * Java's tests build one `App`, call `createKingdom(type)`, then read
 * `app.getKingdom()` back out - the assertions happen *after* creation,
 * against a stored object. There's nothing to store here: providing a
 * Layer and reading a Tag both happen inside the same Effect, so these
 * tests run a tiny Effect per assertion instead. `getKing`/`getCastle`/
 * `getArmy` below are the read side; `makeFactory(type)` is the write side
 * (well, the "which family" side - nothing is mutated either way).
 */
const getCastle = Effect.gen(function* () {
  return yield* Castle;
});
const getKing = Effect.gen(function* () {
  return yield* King;
});
const getArmy = Effect.gen(function* () {
  return yield* Army;
});

const runWith = <A>(effect: Effect.Effect<A, never, Castle | King | Army>, type: KingdomType) =>
  Effect.runPromise(Effect.provide(effect, makeFactory(type)));

describe('factoryMaker', () => {
  test('verifyKingCreation', async () => {
    expect((await runWith(getKing, KingdomType.ELF)).description).toBe(ELF_KING_DESCRIPTION);
    expect((await runWith(getKing, KingdomType.ORC)).description).toBe(ORC_KING_DESCRIPTION);
  });

  test('verifyCastleCreation', async () => {
    expect((await runWith(getCastle, KingdomType.ELF)).description).toBe(ELF_CASTLE_DESCRIPTION);
    expect((await runWith(getCastle, KingdomType.ORC)).description).toBe(ORC_CASTLE_DESCRIPTION);
  });

  test('verifyArmyCreation', async () => {
    expect((await runWith(getArmy, KingdomType.ELF)).description).toBe(ELF_ARMY_DESCRIPTION);
    expect((await runWith(getArmy, KingdomType.ORC)).description).toBe(ORC_ARMY_DESCRIPTION);
  });

  test('verifyElfKingdomCreation', async () => {
    const all = Effect.gen(function* () {
      return { king: yield* King, castle: yield* Castle, army: yield* Army };
    });
    const kingdom = await runWith(all, KingdomType.ELF);
    expect(kingdom.king.description).toBe(ELF_KING_DESCRIPTION);
    expect(kingdom.castle.description).toBe(ELF_CASTLE_DESCRIPTION);
    expect(kingdom.army.description).toBe(ELF_ARMY_DESCRIPTION);
  });

  test('verifyOrcKingdomCreation', async () => {
    const all = Effect.gen(function* () {
      return { king: yield* King, castle: yield* Castle, army: yield* Army };
    });
    const kingdom = await runWith(all, KingdomType.ORC);
    expect(kingdom.king.description).toBe(ORC_KING_DESCRIPTION);
    expect(kingdom.castle.description).toBe(ORC_CASTLE_DESCRIPTION);
    expect(kingdom.army.description).toBe(ORC_ARMY_DESCRIPTION);
  });
});

import type { Layer } from 'effect';
import type { Castle } from './castle';
import type { King } from './king';
import type { Army } from './army';
import { ElfKingdomLive } from './kingdoms/elf-kingdom';
import { OrcKingdomLive } from './kingdoms/orc-kingdom';

/** Java: `enum KingdomType { ELF, ORC }`, nested inside `Kingdom.FactoryMaker`. */
export const KingdomType = {
  ELF: 'ELF',
  ORC: 'ORC',
} as const;

export type KingdomType = (typeof KingdomType)[keyof typeof KingdomType];

/**
 * Java: `FactoryMaker.makeFactory(type)` returns a `KingdomFactory` object
 * - something with `createCastle`/`createKing`/`createArmy` methods still
 * to be called. This returns a `Layer` instead: a description of how to
 * satisfy the Castle/King/Army dependencies, not yet run. Notice there's no
 * `KingdomFactory` type anywhere in this port - Java needs that interface
 * to give `ElfKingdomFactory`/`OrcKingdomFactory` a common supertype to
 * return; `Layer<Castle | King | Army>` already *is* that common type, so
 * defining one would just be restating what `Layer` already expresses.
 */
export const makeFactory = (type: KingdomType): Layer.Layer<Castle | King | Army> =>
  type === KingdomType.ELF ? ElfKingdomLive : OrcKingdomLive;

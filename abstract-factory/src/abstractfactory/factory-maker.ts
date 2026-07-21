import { type Layer } from 'effect';
import type { Castle } from '@kingdom/castle';
import type { King } from '@kingdom/king';
import type { Army } from '@kingdom/army';
import { ElfKingdomFactory } from '@kingdom/elf-kingdom-factory';
import { OrcKingdomFactory } from '@kingdom/orc-kingdom-factory';

export const KingdomType = {
  ELF: 'ELF',
  ORC: 'ORC',
} as const;

export type Kingdom = (typeof KingdomType)[keyof typeof KingdomType];

/**
 * Selects the factory corresponding to the requested kingdom.
 *
 * Each concrete factory is implemented as an Effect `Layer` constructing a
 * complete family of related services.
 *
 * The returned layer provides compatible implementations of `Castle`, `King`
 * and `Army`, allowing client code to depend only on the abstract service
 * interfaces.
 */
export const makeFactory = (
  type: Kingdom
): Layer.Layer<Castle | King | Army> =>
  type === KingdomType.ELF ? ElfKingdomFactory : OrcKingdomFactory;

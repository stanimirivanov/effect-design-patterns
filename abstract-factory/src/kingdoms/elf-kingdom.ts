import { Layer } from 'effect';
import { Castle } from '../castle';
import { King } from '../king';
import { Army } from '../army';

/**
 * Java expresses "the elf family" as a class, `ElfKingdomFactory`, whose
 * three methods each `new` up one elf object. Here "the elf family" is a
 * value: a `Layer` built by merging one small Layer per service. There's no
 * class and no `new` - `Layer.succeed(Tag, value)` just says "when
 * something asks for this Tag, hand it this value", and `Layer.mergeAll`
 * bundles several of those into one Layer that satisfies all three Tags at
 * once. Providing `ElfKingdomLive` to a program is what `new
 * ElfKingdomFactory()` + calling all three create methods was doing in Java
 * - except here it's one composable value instead of a class instantiation
 * plus three method calls.
 */
export const ELF_CASTLE_DESCRIPTION = 'This is the elven castle!';
export const ELF_KING_DESCRIPTION = 'This is the elven king!';
export const ELF_ARMY_DESCRIPTION = 'This is the elven army!';

export const ElfKingdomLive: Layer.Layer<Castle | King | Army> = Layer.mergeAll(
  Layer.succeed(Castle, { description: ELF_CASTLE_DESCRIPTION }),
  Layer.succeed(King, { description: ELF_KING_DESCRIPTION }),
  Layer.succeed(Army, { description: ELF_ARMY_DESCRIPTION })
);

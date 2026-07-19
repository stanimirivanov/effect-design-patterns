import { Layer } from 'effect';
import { Castle } from '../castle';
import { King } from '../king';
import { Army } from '../army';

/** See elfKingdom.ts for the rationale - this is the Orc equivalent of ElfKingdomFactory. */
export const ORC_CASTLE_DESCRIPTION = 'This is the orc castle!';
export const ORC_KING_DESCRIPTION = 'This is the orc king!';
export const ORC_ARMY_DESCRIPTION = 'This is the orc army!';

export const OrcKingdomLive: Layer.Layer<Castle | King | Army> = Layer.mergeAll(
  Layer.succeed(Castle, { description: ORC_CASTLE_DESCRIPTION }),
  Layer.succeed(King, { description: ORC_KING_DESCRIPTION }),
  Layer.succeed(Army, { description: ORC_ARMY_DESCRIPTION })
);

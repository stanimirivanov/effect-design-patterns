import { Effect, Layer } from 'effect';
import { Castle } from './castle';
import { King } from './king';
import { Army } from './army';

const Descriptions = {
  castle: 'This is the orc castle!',
  king: 'This is the orc king!',
  army: 'This is the orc army!',
};

/**
 * Concrete factory producing the orc product family.
 *
 * The layer provides implementations of all abstract kingdom services:
 *
 * - Castle
 * - King
 * - Army
 *
 * Together they form one compatible family of products.
 */
export const OrcKingdomFactory: Layer.Layer<Castle | King | Army> =
  Layer.mergeAll(
    Layer.effect(
      Castle,
      Effect.succeed({
        describe: () => Descriptions.castle,
      })
    ),
    Layer.effect(
      King,
      Effect.succeed({
        describe: () => Descriptions.king,
      })
    ),
    Layer.effect(
      Army,
      Effect.succeed({
        describe: () => Descriptions.army,
      })
    )
  );

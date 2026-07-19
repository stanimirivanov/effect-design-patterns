import { Effect, Option, Stream } from 'effect';
import { makeCar } from '@domain/car';
import { Property } from '@domain/property';

/**
 * Example application demonstrating the Abstract Document pattern.
 *
 * `Effect.gen` sequences Effect operations using generator syntax,
 * allowing asynchronous and effectful code to be written in a linear,
 * imperative style.
 *
 * `Effect.logInfo` emits structured log messages, while
 * `Effect.runPromise` executes the Effect and returns a Promise.
 */
export const program = Effect.gen(function* () {
  yield* Effect.logInfo('Constructing parts and car');

  const wheelProperties = {
    [Property.TYPE]: 'wheel',
    [Property.MODEL]: '15C',
    [Property.PRICE]: 100,
  };

  const doorProperties = {
    [Property.TYPE]: 'door',
    [Property.MODEL]: 'Lambo',
    [Property.PRICE]: 300,
  };

  const carProperties = {
    [Property.MODEL]: '300SL',
    [Property.PRICE]: 10000,
    [Property.PARTS]: [wheelProperties, doorProperties],
  };

  const car = makeCar(carProperties);

  yield* Effect.logInfo('Here is our car:');
  yield* Effect.logInfo(`-> model: ${Option.getOrThrow(car.getModel())}`);
  yield* Effect.logInfo(`-> price: ${Option.getOrThrow(car.getPrice())}`);
  yield* Effect.logInfo('-> parts: ');

  yield* Stream.runForEach(car.getParts(), (part) =>
    Effect.logInfo(
      `\t${Option.getOrNull(part.getType())}/${Option.getOrNull(part.getModel())}/${Option.getOrNull(part.getPrice())}`
    )
  );
});

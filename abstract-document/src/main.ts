import { Effect, Option, Stream } from "effect"
import { makeCar } from "./domain/car"
import { Property } from "./domain/property"

/**
 * Java's `App.main` is an imperative method that logs via SLF4J/Logback.
 * The Effect equivalent is a value - `program` - describing the same
 * steps, run explicitly at the bottom of this file via `Effect.runPromise`.
 * `Effect.logInfo` stands in for `LOGGER.info`; it's part of Effect's own
 * structured logging, so the console output format differs from Logback's
 * (`timestamp=... level=INFO fiber=#0 message="..."` instead of
 * `07:21:57.391 [main] INFO ...`), but it's carrying the same information.
 *
 * `Option.getOrThrow` / `Option.getOrNull` are direct swaps for Java's
 * `.orElseThrow()` / `.orElse(null)`.
 */
export const program = Effect.gen(function* () {
  yield* Effect.logInfo("Constructing parts and car")

  const wheelProperties = {
    [Property.TYPE]: "wheel",
    [Property.MODEL]: "15C",
    [Property.PRICE]: 100
  }

  const doorProperties = {
    [Property.TYPE]: "door",
    [Property.MODEL]: "Lambo",
    [Property.PRICE]: 300
  }

  const carProperties = {
    [Property.MODEL]: "300SL",
    [Property.PRICE]: 10000,
    [Property.PARTS]: [wheelProperties, doorProperties]
  }

  const car = makeCar(carProperties)

  yield* Effect.logInfo("Here is our car:")
  yield* Effect.logInfo(`-> model: ${Option.getOrThrow(car.getModel())}`)
  yield* Effect.logInfo(`-> price: ${Option.getOrThrow(car.getPrice())}`)
  yield* Effect.logInfo("-> parts: ")

  yield* Stream.runForEach(car.getParts(), (part) =>
    Effect.logInfo(
      `\t${Option.getOrNull(part.getType())}/${Option.getOrNull(part.getModel())}/${Option.getOrNull(part.getPrice())}`
    )
  )
})

// Bun's `import.meta.main` is true only when this file is the entry point
// (bun run main.ts), not when it's imported by a test - same purpose as
// Java needing a separate AppTest to call App.main() explicitly, but
// without a separate class.
if (import.meta.main) {
  Effect.runPromise(program)
}

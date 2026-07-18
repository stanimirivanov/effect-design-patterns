import { describe, test } from "bun:test"
import { Effect } from "effect"
import { program } from "../src/main"

describe("main", () => {
  test("should execute program without throwing", async () => {
    // Mirrors AppTest's assertDoesNotThrow(() -> App.main(null)): if
    // Effect.runPromise(program) rejects, the await below throws inside
    // this async test and bun:test reports the failure - no extra
    // assertion needed.
    await Effect.runPromise(program)
  })
})

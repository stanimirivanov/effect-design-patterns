import { describe, test } from "bun:test"
import { Effect } from "effect"
import { program } from "../src/program"

describe("main", () => {
  test("should execute program without throwing", async () => {
    await Effect.runPromise(program)
  })
})

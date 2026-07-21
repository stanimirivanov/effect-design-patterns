import type { Effect } from 'effect';
import { makeActiveCreature, type ActiveCreature } from './active-creature.ts';

/**
 * Creates an active creature representing an Orc.
 *
 * The Active Object pattern is implemented by `makeActiveCreature()`, while
 * this function belongs to the example domain model. Keeping domain-specific
 * factories separate from the generic implementation allows the same Active
 * Object infrastructure to be reused for different types of active objects.
 */
export const makeOrc = (name: string): Effect.Effect<ActiveCreature> =>
  makeActiveCreature(name);

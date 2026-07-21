import type { Effect } from 'effect';
import { makeActiveCreature, type ActiveCreature } from './active-creature.ts';

/**
 * Java: `class Orc extends ActiveCreature { public Orc(String name) {
 * super(name); } }` - a subclass that adds no members and exists only to
 * give the creature a name in the type system. There's no class hierarchy
 * to extend here, so "being an Orc" is just "having been constructed via
 * this function" rather than "having been constructed via this
 * constructor" - same relationship Java expresses with `extends`, minus
 * the inheritance machinery it doesn't actually use.
 */
export const makeOrc = (name: string): Effect.Effect<ActiveCreature> => makeActiveCreature(name);

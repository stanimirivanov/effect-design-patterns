import { Context } from 'effect';
import type { Describable } from './describable';

/**
 * Java's `Castle` interface is just a contract: any code holding a
 * `Castle` reference can call `getDescription()` without knowing which
 * concrete class it got. `Context.Tag` gives the same guarantee plus one
 * more thing Java's interface can't: it also identifies *where to fetch an
 * implementation from* at the point it's needed, via Effect's dependency
 * system. A Tag is simultaneously a type (what you get) and a value (the
 * key used to look it up) - see the README's "Effect constructs, explained"
 * section for the full picture.
 */
export class Castle extends Context.Tag('Castle')<Castle, Describable>() {}

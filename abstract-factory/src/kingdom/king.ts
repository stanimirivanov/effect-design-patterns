import { Context } from 'effect';
import type { Describable } from '@abstractfactory/describable';

/**
 * `Context.Tag` represents a typed service identifier.
 *
 * It serves two purposes:
 *
 * - declares that an Effect depends on a `King`
 * - provides the key used to retrieve the implementation from the Effect Context
 *
 * The concrete implementation is supplied by a `Layer`.
 */
export class King extends Context.Tag('King')<King, Describable>() {}

import { Context } from 'effect';
import type { Describable } from './describable';

/** See castle.ts for the rationale behind modeling this as a Context.Tag. */
export class King extends Context.Tag('King')<King, Describable>() {}

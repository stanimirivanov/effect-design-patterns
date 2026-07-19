import { Context } from 'effect';
import type { Describable } from './describable';

/** See castle.ts for the rationale behind modeling this as a Context.Tag. */
export class Army extends Context.Tag('Army')<Army, Describable>() {}

import type { Stream } from 'effect';
import type { Document } from '@abstractdocument/document';
import { Property } from './property';
import { makePart, type Part } from './part';

/**
 * Adds typed access to the `PARTS` property.
 *
 * Child documents are returned as an Effect `Stream`, allowing lazy
 * traversal using the same API for both in-memory and asynchronous data
 * sources.
 */
export interface HasParts {
  readonly getParts: () => Stream.Stream<Part>;
}

export const hasParts = <T extends Document>(document: T): T & HasParts => ({
  ...document,
  getParts: () => document.children(Property.PARTS, makePart),
});

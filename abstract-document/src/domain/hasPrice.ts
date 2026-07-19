import { Option, Schema, pipe } from 'effect';
import type { Document } from '@abstractdocument/document';
import { Property } from './property';

/**
 * Adds typed access to the `PRICE` property.
 *
 * The property value is decoded using `Schema.Number`, producing an
 * `Option<number>`. Invalid values become `Option.none()` instead of
 * throwing.
 */
export interface HasPrice {
  readonly getPrice: () => Option.Option<number>;
}

export const hasPrice = <T extends Document>(document: T): T & HasPrice => ({
  ...document,
  getPrice: () => pipe(document.get(Property.PRICE), Option.flatMap(Schema.decodeUnknownOption(Schema.Number))),
});

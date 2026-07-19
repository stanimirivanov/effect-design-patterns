import { Option, Schema, pipe } from 'effect';
import type { Document } from '@abstractdocument/document';
import { Property } from './property';

/**
 * Adds typed access to the `MODEL` property.
 *
 * `Option.flatMap` continues only when the property exists.
 * `Schema.decodeUnknownOption` safely decodes the value into a string,
 * returning `Option.none()` if decoding fails.
 */
export interface HasModel {
  readonly getModel: () => Option.Option<string>;
}

export const hasModel = <T extends Document>(document: T): T & HasModel => ({
  ...document,
  getModel: () => pipe(document.get(Property.MODEL), Option.flatMap(Schema.decodeUnknownOption(Schema.String))),
});

import { describe, test, expect } from 'bun:test';
import { Effect, Option, Stream } from 'effect';
import { type Document } from '@abstractdocument/document';
import { makeDocument } from '@abstractdocument/document-impl';

const KEY = 'key';
const VALUE = 'value';

describe('Document', () => {
  test('should put and get value', () => {
    const document = makeDocument({}).put(KEY, VALUE);
    expect(Option.getOrThrow(document.get(KEY))).toBe(VALUE);
  });

  test('should retrieve children', async () => {
    const document = makeDocument({}).put(KEY, [{}, {}]);
    const stream = document.children(KEY, (props) => makeDocument(props));
    const count = await Effect.runPromise(Stream.runCount(stream));
    expect(count).toBe(2);
  });

  test('should retrieve empty stream for non-existing children', async () => {
    const document = makeDocument({});
    const stream = document.children(KEY, (props) => makeDocument(props));
    const count = await Effect.runPromise(Stream.runCount(stream));
    expect(count).toBe(0);
  });

  test('should include props in toString', () => {
    const document = makeDocument({ [KEY]: VALUE });
    expect(document.toString()).toContain(KEY);
    expect(document.toString()).toContain(VALUE);
  });

  test('should throw when constructed with null properties', () => {
    expect(() =>
      makeDocument(null as unknown as Record<string, unknown>)
    ).toThrow();
  });

  test('should put and get nested document', () => {
    const nested = makeDocument({}).put('nestedKey', 'nestedValue');
    const document = makeDocument({}).put('nested', nested);

    const retrieved = Option.getOrThrow(document.get('nested')) as Document;
    expect(Option.getOrThrow(retrieved.get('nestedKey'))).toBe('nestedValue');
  });

  test('should update existing value', () => {
    const original = makeDocument({}).put(KEY, 'originalValue');
    expect(Option.getOrThrow(original.get(KEY))).toBe('originalValue');

    const updated = original.put(KEY, 'updatedValue');
    expect(Option.getOrThrow(updated.get(KEY))).toBe('updatedValue');
    expect(Option.getOrThrow(original.get(KEY))).toBe('originalValue');
  });
});

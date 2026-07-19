import { describe, test, expect } from 'bun:test';
import { Effect, Option, Stream } from 'effect';
import { makePart } from '@domain/part';
import { makeCar } from '@domain/car';
import { Property } from '@domain/property';

const TEST_PART_TYPE = 'test-part-type';
const TEST_PART_MODEL = 'test-part-model';
const TEST_PART_PRICE = 0;

const TEST_CAR_MODEL = 'test-car-model';
const TEST_CAR_PRICE = 1;

describe('Domain', () => {
  test('should construct part', () => {
    const part = makePart({
      [Property.TYPE]: TEST_PART_TYPE,
      [Property.MODEL]: TEST_PART_MODEL,
      [Property.PRICE]: TEST_PART_PRICE,
    });

    expect(Option.getOrThrow(part.getType())).toBe(TEST_PART_TYPE);
    expect(Option.getOrThrow(part.getModel())).toBe(TEST_PART_MODEL);
    expect(Option.getOrThrow(part.getPrice())).toBe(TEST_PART_PRICE);
  });

  test('should construct car', async () => {
    const car = makeCar({
      [Property.MODEL]: TEST_CAR_MODEL,
      [Property.PRICE]: TEST_CAR_PRICE,
      [Property.PARTS]: [{}, {}],
    });

    expect(Option.getOrThrow(car.getModel())).toBe(TEST_CAR_MODEL);
    expect(Option.getOrThrow(car.getPrice())).toBe(TEST_CAR_PRICE);

    const partCount = await Effect.runPromise(Stream.runCount(car.getParts()));
    expect(partCount).toBe(2);
  });
});

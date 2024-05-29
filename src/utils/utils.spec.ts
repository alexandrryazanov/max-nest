import { sum } from './index';

describe('Positive values', () => {
  test('function should return sum of 2 numbers', () => {
    expect(sum(2, 2)).toBe(4);
  });

  // test('function should throw error if args are string', () => {
  //   expect(sum('2', '2')).toThrowError('Args are string');
  // });
});

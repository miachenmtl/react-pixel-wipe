import { tools } from '../src/components/ReactPixelWipe/logic/utils/canvasUtils';

describe('The pickInt tool', () => {
  it('selects a positive random integer less than or equal to the provided number', () => {
    expect(tools.pickInt(1)).toEqual(1);
    const randomNumber = tools.pickInt(10);
    expect(randomNumber).toBeGreaterThan(0);
    expect(randomNumber).toBeLessThanOrEqual(10);
    expect(Math.floor(randomNumber)).toBe(randomNumber);
  });
});

describe('The transposeArray tool', () => {
  it('takes an array corresponding to row-order indices to col-order indices', () => {
    const initialArray = [
      0, 1, 2, 3, 4,
      5, 6, 7, 8, 9,
      10, 11, 12, 13, 14,
    ];
    const width = 5;

    const expectedArray = [
      0, 5, 10,
      1, 6, 11,
      2, 7, 12,
      3, 8, 13,
      4, 9, 14,
    ];

    const actual = tools.transposeArray(initialArray, width);
    expect(actual).toEqual(expectedArray);
  });
});

describe('The createInitialIndices tool', () => {
  it('returns an ascending array of indices of given length for a downward wipe', () => {
    const expectedArray = [0, 1, 2, 3, 4];
    const actual = tools.createInitialIndices(5, 4, 'down');
    expect(actual).toEqual(expectedArray);
  });
  it('returns an descending array of indices of given length for a upward wipe', () => {
    const expectedArray = [4, 3, 2, 1, 0];
    const actual = tools.createInitialIndices(5, 4, 'up');
    expect(actual).toEqual(expectedArray);
  });
  it('returns a transposed ascending array of indices of given length and width for a rightward wipe', () => {
    /*
    0 1 2 3
    4 5 6 7
    */
    const expectedArray = [0, 4, 1, 5, 2, 6, 3, 7];
    const actual = tools.createInitialIndices(8, 4, 'right');
    expect(actual).toEqual(expectedArray);
  });
  it('returns a transposed descending array of indices of given length and width for a leftward wipe', () => {
    const expectedArray = [7, 3, 6, 2, 5, 1, 4, 0];
    const actual = tools.createInitialIndices(8, 4, 'left');
    expect(actual).toEqual(expectedArray);
  });
});

import {
  tools,
  createShuffledIndices,
  createDestImageData,
  calculateImageDims,
  calculateAnimationSettings,
} from '../src/components/ReactPixelWipe/logic/utils/canvasUtils';

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
  it('throws an error when the wipe direction is not recognized', () => {
    expect(() => { tools.createInitialIndices(0, 0, 'spiral'); }).toThrow(
      'Unrecognized wipeDirection prop `spiral`!',
    );
  });
});

describe('The createDestImageData canvas helper', () => {
  it('creates an ImageData array of given image with alpha 0', () => {
    const expectedData = Uint8ClampedArray.from([
      12, 12, 34, 0, 12, 14, 34, 0,
      12, 13, 36, 0, 11, 12, 34, 0,
      12, 12, 44, 0, 12, 18, 34, 0,
    ]);
    const mockData = Uint8ClampedArray.from([
      12, 12, 34, 100, 12, 14, 34, 10,
      12, 13, 36, 20, 11, 12, 34, 30,
      12, 12, 44, 0, 12, 18, 34, 10,
    ]);
    const actual = createDestImageData({ width: 2, height: 3, data: mockData });
    expect(actual instanceof ImageData).toBe(true);
    expect(actual.data).toEqual(expectedData);
  });
});

describe('The calculateImageDims canvas helper', () => {
  // Dimensions are: sx, sy, swidth, sheight, dx, dy, dwidth, dheight
  // Image will always be centered
  it('calculates source and dest dimension arguments for `putImageData` to "cover" the canvas', () => {
    const image1Dims = [30, 25];
    const canvas1Dims = [40, 40];
    const canvas2Dims = [50, 30];

    const expectedArgs1 = [3, 0, 25, 25, 0, 0, 40, 40];
    const actual1 = calculateImageDims(...image1Dims, ...canvas1Dims, 'cover');
    expect(actual1).toEqual(expectedArgs1);

    const expectedArgs2 = [0, 4, 30, 18, 0, 0, 50, 30];
    const actual2 = calculateImageDims(...image1Dims, ...canvas2Dims, 'cover');
    expect(actual2).toEqual(expectedArgs2);
  });

  it('calculates source and dest dimension arguments for `putImageData` to "contain" the image', () => {
    const image1Dims = [30, 25];
    const canvas1Dims = [40, 40];
    const canvas2Dims = [50, 30];

    const expectedArgs1 = [0, 0, 30, 25, 0, 4, 40, 33];
    const actual1 = calculateImageDims(...image1Dims, ...canvas1Dims, 'contain');
    expect(actual1).toEqual(expectedArgs1);

    const expectedArgs2 = [0, 0, 30, 25, 7, 0, 36, 30];
    const actual2 = calculateImageDims(...image1Dims, ...canvas2Dims, 'contain');
    expect(actual2).toEqual(expectedArgs2);
  });

  it('calculates source and dest dimension arguments for `putImageData` to "fit" the canvas', () => {
    const image1Dims = [30, 25];
    const canvas1Dims = [40, 40];
    const canvas2Dims = [50, 30];

    const expectedArgs1 = [0, 0, 30, 25, 0, 0, 40, 40];
    const actual1 = calculateImageDims(...image1Dims, ...canvas1Dims, 'fit');
    expect(actual1).toEqual(expectedArgs1);

    const expectedArgs2 = [0, 0, 30, 25, 0, 0, 50, 30];
    const actual2 = calculateImageDims(...image1Dims, ...canvas2Dims, 'fit');
    expect(actual2).toEqual(expectedArgs2);
  });

  it('calculates source and dest dimension arguments for `putImageData` so that there is no scaling (keyword "none")', () => {
    const image1Dims = [30, 25];
    const canvas1Dims = [40, 40];
    const canvas2Dims = [50, 30];
    const canvas3Dims = [20, 20];

    const expectedArgs1 = [0, 0, 30, 25, 5, 8, 30, 25];
    const actual1 = calculateImageDims(...image1Dims, ...canvas1Dims, 'none');
    expect(actual1).toEqual(expectedArgs1);

    const expectedArgs2 = [0, 0, 30, 25, 10, 3, 30, 25];
    const actual2 = calculateImageDims(...image1Dims, ...canvas2Dims, 'none');
    expect(actual2).toEqual(expectedArgs2);

    const expectedArgs3 = [5, 3, 20, 20, 0, 0, 20, 20];
    const actual3 = calculateImageDims(...image1Dims, ...canvas3Dims, 'none');
    expect(actual3).toEqual(expectedArgs3);
  });

  it('throws an error when the `scaleImageTo` prop is not recognized', () => {
    expect(() => { calculateImageDims(3, 4, 5, 6, 'green'); }).toThrow(
      'Unrecognized scaleImageTo prop `green`!',
    );
  });
});

describe('The createShuffledIndices canvas helper', () => {
  it('generates a partially-randomized array of indices according to an offset', () => {
    const expectedOneOffsetArray = [1, 2, 3, 0];
    const actual = createShuffledIndices(4, 4, 'down', 0);
    expect(actual).toEqual(expectedOneOffsetArray);

    const shuffledArray = createShuffledIndices(10, 5, 'down', 3);
    const sortedArray = Array(10).fill(0).map((el, i) => i);
    shuffledArray.forEach((el, i) => {
      expect(el).toBeLessThanOrEqual(i + 3);
    });
    expect(shuffledArray.sort()).toEqual(sortedArray);
  });
});

describe('The calculateAnimationSettings canvas helper', () => {
  it('calculates max and min opacity increments and the target ms per frame', () => {
    const expected = {
      targetFrameInterval: 20,
      bigDelta: 5 * 17,
      littleDelta: 15,
    };
    const actual = calculateAnimationSettings(
      { pixelFadeIntervals: [60, 340], framesPerSecond: 50 },
    );
    expect(actual).toEqual(expected);
  });
});
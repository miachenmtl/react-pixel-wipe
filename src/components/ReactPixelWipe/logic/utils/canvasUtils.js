const pickInt = (int) => Math.floor(Math.random() * int) + 1;

const transposeArray = (array, width) => {
  const rotatedArray = [];

  const rows = array.reduce((acc, val, i) => {
    const rowIndex = Math.floor(i / width);
    if (rowIndex >= acc.length) acc.push([val]);
    else acc[rowIndex].push(val);
    return acc;
  }, []);

  for (let i = 0; i < width; i += 1) {
    const col = rows.map((row) => row[i]);
    rotatedArray.push(...col);
  }

  return rotatedArray;
};

const createInitialIndices = (length, width, wipeDirection) => {
  const initialArray = Array(length).fill(0).map((el, i) => i);
  switch (wipeDirection) {
    case 'down': return initialArray;
    case 'up': return initialArray.reverse();
    case 'left': return transposeArray(initialArray, width).reverse();
    case 'right': return transposeArray(initialArray, width);
    default: throw new Error(`Unrecognized wipeDirection argument: ${wipeDirection}`);
  }
};

const createDestImageData = ({ width, height, data }) => {
  const destData = new Uint8ClampedArray(data.length).fill(0);
  for (let currentPixel = 0; currentPixel < width * height; currentPixel += 1) {
    const offset = 4 * currentPixel;
    destData.set(data.subarray(offset, offset + 3), offset);
  }
  return new ImageData(destData, width, height);
};

const createShuffledIndices = (length, width, wipeDirection, offset) => {
  const indices = createInitialIndices(length, width, wipeDirection);
  for (let i = 0; i < length - 1; i += 1) {
    const j = i + pickInt(Math.min(offset, length - 1 - i));
    const jthEl = indices[j];
    indices[j] = indices[i];
    indices[i] = jthEl;
  }
  return indices;
};

const calculateImageDims = (imageWidth, imageHeight, canvasWidth, canvasHeight, imageSize) => {
  const imageAspectRatio = imageWidth / imageHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;
  const isWiderThanCanvas = imageAspectRatio > canvasAspectRatio;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;
  let destX = 0;
  let destY = 0;
  let destWidth = canvasWidth;
  let destHeight = canvasHeight;

  switch (imageSize) {
    case 'cover':
      if (isWiderThanCanvas) {
        sourceWidth = Math.round(sourceHeight / canvasAspectRatio);
        sourceX = Math.round((imageWidth - sourceWidth) / 2);
      } else {
        sourceHeight = Math.round(sourceWidth / canvasAspectRatio);
        sourceY = Math.round((imageHeight - sourceHeight) / 2);
      }
      break;
    case 'contain':
      if (isWiderThanCanvas) {
        destHeight = Math.round(destWidth / imageAspectRatio);
        destY = Math.round((canvasHeight - destHeight) / 2);
      } else {
        destWidth = Math.round(destHeight * imageAspectRatio);
        destX = Math.round((canvasWidth - destWidth) / 2);
      }
      break;
    case 'fit':
      break;
    default:
      throw new Error(`Unrecognized imageSize prop ${imageSize}!`);
  }

  return [
    sourceX, sourceY, sourceWidth, sourceHeight,
    destX, destY, destWidth, destHeight,
  ];
};

const calculateAnimationSettings = (
  { pixelFadeIntervals: [fastFadeInterval, slowFadeInterval], framesPerSecond },
) => {
  const targetFrameInterval = 1000 / framesPerSecond;
  const numberOfFastFrames = Math.round(fastFadeInterval / targetFrameInterval);
  const bigDelta = Math.round(255 / numberOfFastFrames);
  const numberOfSlowFrames = Math.round(slowFadeInterval / targetFrameInterval);
  const littleDelta = Math.round(255 / numberOfSlowFrames);
  return { targetFrameInterval, bigDelta, littleDelta };
};

const tools = {
  pickInt, transposeArray, createInitialIndices,
};

export {
  tools,
  createShuffledIndices,
  createDestImageData,
  calculateImageDims,
  calculateAnimationSettings,
};

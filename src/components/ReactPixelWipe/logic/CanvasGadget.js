import {
  createDestImageData,
  createShuffledIndices,
  calculateImageDims,
  calculateAnimationSettings,
} from './utils/canvasUtils';

class CanvasGadget {
  #bufferContext

  #displayContext

  #destImageData

  #shuffledPixelIndices

  #totalPixels

  #lastOpaquePixel = -1 // i.e. alpha is below 255 from 0 on

  #targetLastPixel = 0 // one after target last alpha > 0 pixel

  #lastPixel = 0 // one after actual last alpha > 0 pixel

  #dirtyDims

  #animationSettings

  #onAfterWipe

  #rafId = -1

  #advanceFrame = (stepCount, isScrollingDown) => {
    const { data: pixelData } = this.#destImageData;
    const { bigDelta, littleDelta } = this.#animationSettings;

    if (isScrollingDown) {
      let newLastOpaquePixel = this.#lastOpaquePixel;
      for (let i = this.#lastOpaquePixel; i < this.#targetLastPixel; i += 1) {
        const alphaIndex = 4 * this.#shuffledPixelIndices[i] + 3;
        const distanceToPixel = i - this.#lastOpaquePixel;
        const totalDistance = this.#targetLastPixel - this.#lastOpaquePixel;
        const delta = littleDelta + Math.round(
          (1 - distanceToPixel / totalDistance) * (bigDelta - littleDelta),
        );
        pixelData[alphaIndex] += stepCount * delta;
        if (pixelData[alphaIndex] === 255) newLastOpaquePixel = i;
      }

      this.#lastOpaquePixel = newLastOpaquePixel;
      this.#lastPixel = this.#targetLastPixel;

      return this.#lastOpaquePixel !== this.#targetLastPixel - 1;
    }
    let newLastPixel = this.#lastPixel;
    // backward iteration to make it easier to get the newlastpixel
    for (let i = this.#lastPixel - 1; i >= this.#targetLastPixel; i -= 1) {
      const alphaIndex = 4 * this.#shuffledPixelIndices[i] + 3;
      const distanceToPixel = i - this.#targetLastPixel;
      const totalDistance = this.#lastPixel - this.#targetLastPixel;
      const delta = littleDelta + Math.round(
        (distanceToPixel / totalDistance) * (bigDelta - littleDelta),
      );
      pixelData[alphaIndex] -= stepCount * delta;
      if (pixelData[alphaIndex] === 0) newLastPixel = i;
    }
    this.#lastOpaquePixel = this.#targetLastPixel - 1;
    this.#lastPixel = newLastPixel;

    return this.#lastPixel !== this.#targetLastPixel;
  }

  #animate = (timestamp, newLastPixel, prevTimestamp, wasScrollingDown) => {
    const { targetFrameInterval } = this.#animationSettings;
    // calculate number of frames to step
    let stepsToAdvance = 1;
    if (prevTimestamp !== null) {
      const elapsedMs = timestamp - prevTimestamp;
      stepsToAdvance = Math.floor(elapsedMs / targetFrameInterval);
    }

    // if enough time elapsed advance frame, otherwise, call raf again
    if (stepsToAdvance >= 1) {
      // determine new scroll direction or maintain scroll direction
      let isScrollingDown;
      if (newLastPixel !== this.#targetLastPixel) {
        isScrollingDown = newLastPixel > this.#targetLastPixel;
      } else {
        isScrollingDown = wasScrollingDown;
      }

      // set new target and advance frame
      this.#targetLastPixel = newLastPixel;
      const hasAnotherFrame = this.#advanceFrame(stepsToAdvance, isScrollingDown);

      // render
      this.#render();

      // continue or stop animation
      if (hasAnotherFrame) {
        this.#rafId = window.requestAnimationFrame((newTimestamp) => {
          this.#animate(newTimestamp, newLastPixel, timestamp, isScrollingDown);
        });
      } else {
        if (this.#lastOpaquePixel === this.#totalPixels - 1) this.#onAfterWipe();
        this.#rafId = -1;
      }
    } else {
      // pass on args to next animation frame
      this.#rafId = window.requestAnimationFrame((newTimestamp) => {
        this.#animate(newTimestamp, newLastPixel, prevTimestamp, wasScrollingDown);
      });
    }
  }

  #render = () => {
    this.#bufferContext.putImageData(this.#destImageData, 0, 0, ...this.#dirtyDims);
    this.#displayContext.drawImage(this.#bufferContext.canvas, 0, 0);
  }

  constructor({
    width, height, settings, imgEl, displayCanvasEl,
  }) {
    // initialize buffer canvas
    const bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    this.#bufferContext = bufferCanvas.getContext('2d');

    // initialize display canvas
    /* eslint-disable no-param-reassign */
    displayCanvasEl.width = width;
    displayCanvasEl.height = height;
    /* eslint-enable no-param-reassign */
    this.#displayContext = displayCanvasEl.getContext('2d');
    this.#displayContext.globalCompositeOperation = 'copy';

    // initialize image data
    const imageDims = calculateImageDims(
      imgEl.width,
      imgEl.height,
      width,
      height,
      settings.imageSize,
    );
    this.#dirtyDims = imageDims.slice(4);
    this.#bufferContext.drawImage(imgEl, ...imageDims);
    const sourceImageData = this.#bufferContext.getImageData(0, 0, width, height);
    this.#destImageData = createDestImageData(sourceImageData);

    const { shuffleOffset, wipeDirection, onAfterWipe } = settings;

    // initialize pixel data
    this.#totalPixels = width * height;
    this.#shuffledPixelIndices = createShuffledIndices(
      this.#totalPixels, width, wipeDirection, shuffleOffset,
    );
    this.#animationSettings = calculateAnimationSettings(settings);
    this.#onAfterWipe = onAfterWipe;
  }

  triggerAnimation = (scrollProgress) => {
    const newTargetLastPixel = Math.round(scrollProgress * this.#totalPixels);
    if (this.#rafId !== -1) {
      window.cancelAnimationFrame(this.#rafId);
    }

    this.#rafId = window.requestAnimationFrame((timestamp) => {
      this.#animate(timestamp, newTargetLastPixel, null);
    });
  };
}

export default CanvasGadget;

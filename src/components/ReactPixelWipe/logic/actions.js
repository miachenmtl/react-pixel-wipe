import CanvasGadget from './CanvasGadget';
import { handleObserve, parseScrollLength } from './utils/domUtils';

const updateDimensions = (state, payload) => {
  const {
    isMeasured,
    canvasGadget: { shuffleRatio },
    scrollGadget: { scrollLength, boxesPerView },
  } = state;
  const { width: measuredWidth, height: measuredHeight } = payload;
  if (measuredWidth * measuredHeight > 0 && !isMeasured) {
    // console.log('container dimensions measured', measuredWidth, measuredHeight);

    const shuffleOffset = Math.round(shuffleRatio * measuredWidth * measuredHeight);
    const measuredCanvasGadgetState = { ...state.canvasGadget, shuffleOffset };

    const baseScrollHeight = parseScrollLength(scrollLength, measuredHeight);
    const boxHeight = Math.round(measuredHeight / boxesPerView);
    const totalBoxes = Math.ceil(baseScrollHeight / boxHeight);

    const boxes = Array(totalBoxes).fill(null).map(() => ({
      isIntersecting: false,
      intersectionRatio: 0,
    }));
    const intersectionStates = {
      isNearBeginning: true,
      boxes,
      isNearEnd: false,
    };

    const measuredScrollGadgetState = {
      ...state.scrollGadget,
      totalBoxes,
      boxHeight,
      intersectionStates,
    };
    return {
      ...state,
      dimensions: {
        width: measuredWidth,
        height: measuredHeight,
      },
      isMeasured: true,
      canvasGadget: measuredCanvasGadgetState,
      scrollGadget: measuredScrollGadgetState,
    };
  }
  // console.log('Already measured', isMeasured, width, height);
  return state;
};

const createCanvasGadget = (state, payload) => {
  const {
    canvasGadget: {
      wipeDirection,
      scaleImageTo,
      shuffleOffset,
      pixelFadeIntervals,
      framesPerSecond,
      disableAfterWipe,
      onAfterWipe: onAfterWipeProp,
      gadget,
    },
    dimensions: { width, height },
  } = state;
  if (gadget === null) {
    // console.log('Creating canvas gadget: payload is', payload);
    const { imgEl, displayCanvasEl, disable } = payload;
    const onAfterWipe = disableAfterWipe
      ? () => { disable(); onAfterWipeProp(); }
      : () => { onAfterWipeProp(); };
    const settings = {
      wipeDirection,
      scaleImageTo,
      shuffleOffset,
      pixelFadeIntervals,
      framesPerSecond,
      onAfterWipe,
    };
    const newGadget = new CanvasGadget({
      width, height, settings, imgEl, displayCanvasEl,
    });
    const measuredCanvasGadgetState = {
      ...state.canvasGadget, gadget: newGadget,
    };
    return { ...state, canvasGadget: measuredCanvasGadgetState };
  }
  // console.log('Canvas gadget already created:', gadget);
  return state;
};

const createScrollGadget = (state, payload) => {
  const {
    dimensions: { height: containerHeight },
    scrollGadget: {
      boxHeight,
      intersectionStates,
      observerThresholds,
    },
  } = state;
  const {
    root,
    topEl,
    boxEls,
    bottomEl,
    updateScrollProgress,
  } = payload;
  if (state.scrollGadget.observer === null) {
    // console.log(`Creating observer, payload is ${payload}.`);
    const threshold = observerThresholds;
    const observer = new IntersectionObserver((entries) => {
      handleObserve(entries, intersectionStates, boxHeight, containerHeight, updateScrollProgress);
    }, { root, threshold });
    observer.observe(topEl);
    boxEls.forEach((boxEl) => { observer.observe(boxEl); });
    observer.observe(bottomEl);

    const measuredScrollGadgetState = {
      ...state.scrollGadget,
      observer,
    };

    return {
      ...state,
      scrollGadget: measuredScrollGadgetState,
    };
  }
  return state;
};

const updateScrollProgress = (state, payload) => {
  const {
    canvasGadget: { gadget }, scrollProgress,
  } = state;
  const { scrollProgress: newScrollProgress } = payload;
  if (scrollProgress !== newScrollProgress) {
    // console.log(`Updating scroll progress to ${newScrollProgress}`);
    if (gadget) {
      gadget.triggerAnimation(newScrollProgress);
    }

    return {
      ...state, scrollProgress: newScrollProgress,
    };
  }
  // console.log(`Scroll progress is still ${scrollProgress}.`);
  return state;
};

const disable = (state) => {
  // console.log('Disabling gadgetry');
  if (state.scrollGadget.observer !== null) {
    state.scrollGadget.observer.disconnect();
  }
  const disabledScrollGadget = { ...state.scrollGadget, observer: null };
  return { ...state, isDisabled: true, scrollGadget: disabledScrollGadget };
};

export {
  updateDimensions, createCanvasGadget, createScrollGadget, updateScrollProgress, disable,
};

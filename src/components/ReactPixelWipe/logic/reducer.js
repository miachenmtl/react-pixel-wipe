import {
  updateDimensions, createCanvasGadget, createScrollGadget, updateScrollProgress, disable,
} from './actions';

const initializeState = (
  defaultState,
  {
    isDisabled,
    imageSize,
    wipeDirection,
    scrollLength,
    shuffleRatio,
    disableAfterWipe,
    onAfterWipe,
  },
  {
    boxesPerView, pixelFadeIntervals, framesPerSecond, observerThresholds,
  },
) => {
  const initialState = { ...defaultState, isDisabled };
  initialState.scrollGadget = {
    ...defaultState.scrollGadget,
    scrollLength,
    boxesPerView,
    observerThresholds,
  };
  initialState.canvasGadget = {
    ...defaultState.canvasGadget,
    wipeDirection,
    imageSize,
    shuffleRatio,
    pixelFadeIntervals,
    framesPerSecond,
    disableAfterWipe,
    onAfterWipe,
  };

  return initialState;
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'updateDimensions':
      return updateDimensions(state, payload);

    case 'createCanvasGadget':
      return createCanvasGadget(state, payload);

    case 'createScrollGadget':
      return createScrollGadget(state, payload);

    case 'updateScrollProgress':
      return updateScrollProgress(state, payload);

    case 'disable':
      return disable(state);

    case 'reinitializeState':
      if (state.scrollGadget.observer !== null) {
        state.scrollGadget.observer.disconnect();
      }
      return initializeState(payload.state, payload.props, payload.options);

    default: {
      throw new Error(`Action of type ${type} with payload ${payload} not recognized!`);
    }
  }
};

export { initializeState, reducer };

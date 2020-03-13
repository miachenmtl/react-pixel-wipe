import {
  useRef, useReducer, useCallback, useState,
} from 'react';

import { initializeState, reducer } from './reducer';
import { processDomNode } from './utils/domUtils';

// Null properties will hold gadgets
// Other properties are placeholders to be replaced either
// when state initialized or refs have been processed
const defaultState = {
  isDisabled: false,
  dimensions: {
    width: 0,
    height: 0,
  },
  isMeasured: false,
  scrollGadget: {
    scrollLength: '',
    boxesPerView: 0,
    totalBoxes: 0,
    boxHeight: 0,
    intersectionStates: [{
      isNearBeginning: true,
      boxes: [],
      isNearEnd: false,
    }],
    observerThresholds: 0,
    observer: null,
  },
  canvasGadget: {
    wipeDirection: 'bottom',
    scaleImageTo: 'cover',
    shuffleRatio: 0,
    shuffleOffset: 0,
    pixelFadeIntervals: [],
    framesPerSecond: 0,
    disableAfterWipe: false,
    onAfterWipe: () => {},
    gadget: null,
  },
  scrollProgress: 0,
  debugMode: true,
};

// one-level-deep equal
const hasChanged = (obj1, obj2) => {
  let isDifferent = false;
  Object.keys(obj1).forEach((key) => {
    if (obj1[key] !== obj2[key]) isDifferent = true;
  });
  Object.keys(obj2).forEach((key) => {
    if (obj2[key] !== obj1[key]) isDifferent = true;
  });
  return isDifferent;
};

const createEmptyRefs = () => ({
  canvasRef: null,
  imgRef: null,
  observerRef: null,
  observeeRefs: {
    topRef: null,
    boxRefs: [],
    bottomRef: null,
  },
});

const useGadgetry = (props, options) => {
  const refs = useRef(createEmptyRefs());

  const [prevProps, setPrevProps] = useState(props);
  const [prevOptions, setPrevOptions] = useState(options);

  const [state, dispatch] = useReducer(
    reducer,
    defaultState,
    (uninitializedState) => initializeState(uninitializedState, props, options),
  );

  if (hasChanged(prevProps, props) || hasChanged(prevOptions, options)) {
    // FIXME: this is... less than ideal
    const currentImgRef = refs.current.imgRef;
    refs.current = createEmptyRefs();
    refs.current.imgRef = currentImgRef;
    dispatch({ type: 'reinitializeState', payload: { state: defaultState, props, options } });

    setPrevProps(props);
    setPrevOptions(options);
  }

  const refCallback = useCallback((node) => {
    processDomNode(
      node,
      refs,
      state.isMeasured,
      state.scrollGadget.totalBoxes,
      dispatch,
    );
  }, [state.isMeasured, state.scrollGadget.totalBoxes]);

  return {
    refCallback,
    dimensions: state.dimensions,
    shouldRenderScrollObserver: state.isMeasured && !state.isDisabled,
    totalBoxes: state.scrollGadget.totalBoxes,
    boxHeight: state.scrollGadget.boxHeight,
    scrollProgress: state.scrollProgress,
  };
};

export default useGadgetry;

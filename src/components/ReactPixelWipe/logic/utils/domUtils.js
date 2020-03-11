const getKey = (el) => {
  const attr = el.getAttribute('data-scroll-key');
  const KEYNAMES = ['top', 'bottom', 'observer', 'scroller'];
  if (KEYNAMES.includes(attr)) return attr;

  const parsed = parseInt(attr, 16);
  if (typeof parsed === 'number') return parsed;
  throw new Error(`Unrecognized data-scroll-key ${attr}!`);
};

const getRefName = (el) => {
  if (el.tagName === 'CANVAS') return 'canvasRef';
  if (el.tagName === 'IMG') return 'imgRef';
  if (el.tagName === 'DIV') {
    const divKey = getKey(el);
    if (divKey === 'observer') return 'observerRef';
    if (divKey === 'scroller') return 'scrollerRef';
    if (divKey === 'top') return ['observeeRefs', 'topRef'];
    if (divKey === 'bottom') return ['observeeRefs', 'bottomRef'];
    if (typeof divKey === 'number') return ['observeeRefs', 'boxRefs', divKey];
  }
  throw new Error(`Unrecognized refName for ${el}!`);
};

const checkStatus = (refValues) => {
  let isReadyForCanvasGadget = true;
  let isReadyForScrollGadget = true;
  if (Object.values(refValues).includes(null)) isReadyForCanvasGadget = false;
  if (Object.values(refValues.observeeRefs).includes(null)) isReadyForScrollGadget = false;
  if (refValues.observeeRefs.boxRefs.includes(null)) isReadyForScrollGadget = false;
  return { isReadyForCanvasGadget, isReadyForScrollGadget };
};

// mutate refs to avoid rerenders
/* eslint-disable no-param-reassign */
const processDomNode = (node, refs, isMeasured, totalBoxes, dispatch) => {
  if (node === null) return;
  const refName = getRefName(node);
  if (typeof refName === 'string') refs.current[refName] = node;
  else if (refName.length === 2) refs.current[refName[0]][refName[1]] = node;
  else if (refName.length === 3) refs.current[refName[0]][refName[1]][refName[2]] = node;

  if (refName === 'observerRef') {
    const { width, height } = node.getBoundingClientRect();
    dispatch({
      type: 'updateDimensions',
      payload: {
        width, height,
      },
    });
    refs.current.observeeRefs.boxRefs = Array(totalBoxes).fill(null);
  }
  if (refName.length === 2 && refName[1] === 'topRef') {
    node.focus();
  }

  if (isMeasured) {
    const { isReadyForCanvasGadget, isReadyForScrollGadget } = checkStatus(refs.current);
    // The actions have code to check if gadgets already created
    if (isReadyForCanvasGadget) {
      const disable = () => { dispatch({ type: 'disable' }); };
      dispatch({
        type: 'createCanvasGadget',
        payload: {
          imgEl: refs.current.imgRef,
          displayCanvasEl: refs.current.canvasRef,
          disable,
        },
      });
    }
    if (isReadyForScrollGadget) {
      const updateScrollProgress = (scrollProgress) => {
        dispatch({ type: 'updateScrollProgress', payload: { scrollProgress } });
      };
      dispatch({
        type: 'createScrollGadget',
        payload: {
          root: refs.current.observerRef,
          topEl: refs.current.observeeRefs.topRef,
          boxEls: refs.current.observeeRefs.boxRefs,
          bottomEl: refs.current.observeeRefs.bottomRef,
          updateScrollProgress,
        },
      });
    }
  }
};
/* eslint-enable no-param-reassign */

// mutate intersectionStates to avoid rerenders
/* eslint-disable no-param-reassign */
const handleObserve = (
  entries, intersectionStates, boxHeight, containerHeight, updateScrollProgress,
) => {
  const { boxes } = intersectionStates;
  const totalScrollHeight = boxHeight * boxes.length + containerHeight;
  entries.forEach((entry) => {
    const key = getKey(entry.target);
    if (key === 'top') {
      intersectionStates.isNearBeginning = entry.isIntersecting;
    } else if (key === 'bottom') {
      intersectionStates.isNearEnd = entry.isIntersecting;
    } else if (typeof key === 'number') {
      boxes[key].isIntersecting = entry.isIntersecting;
      boxes[key].intersectionRatio = entry.intersectionRatio;
    }
  });

  const intersections = boxes.map(({ isIntersecting }) => isIntersecting);
  const firstVisibleBox = intersections.indexOf(true);
  const lastVisibleBox = intersections.lastIndexOf(true);

  // 4 cases, handle from top to bottom
  if (intersectionStates.isNearBeginning && firstVisibleBox === -1) {
    // console.log('At top');
    updateScrollProgress(0);
  } else if (!intersectionStates.isNearEnd) {
    let yOffset = lastVisibleBox * boxHeight;
    yOffset += boxes[lastVisibleBox].intersectionRatio * boxHeight;
    // console.log('Somewhere in the middle:');
    // console.log('y offset / y remaining', yOffset, totalScrollHeight - yOffset);
    updateScrollProgress(yOffset / totalScrollHeight);
  } else if (intersectionStates.isNearEnd && firstVisibleBox !== -1) {
    let yRemaining = (boxes.length - firstVisibleBox - 1) * boxHeight;
    yRemaining += boxes[firstVisibleBox].intersectionRatio * boxHeight;
    // console.log('Near the bottom:');
    // console.log('y offset / y remaining', totalScrollHeight - yRemaining, yRemaining);
    updateScrollProgress((totalScrollHeight - yRemaining) / totalScrollHeight);
  } else {
    // console.log('At bottom');
    updateScrollProgress(1);
  }
};
/* eslint-enable no-param-reassign */

const parseScrollLength = (scrollLength, height) => {
  const UNITS = ['x', 'px'];

  const [, valueString, unit] = scrollLength.match(/([\d.]+)([a-z]+)/);
  const value = valueString.includes('.') ? parseFloat(valueString) : parseInt(valueString, 10);
  if (typeof value !== 'number') throw new Error(`Invalid value ${valueString} in \`scrollLength\` prop ${scrollLength}!`);
  if (!UNITS.includes(unit)) throw new Error(`Invalid unit ${unit} in \`scrollLength\` prop ${scrollLength}!`);

  switch (unit) {
    case 'x':
      return value * height;
    case 'px':
      return value;
    default:
      throw new Error('Error in `parseScrollLength` function!');
  }
};

export {
  getKey, getRefName, checkStatus, handleObserve, processDomNode, parseScrollLength,
};

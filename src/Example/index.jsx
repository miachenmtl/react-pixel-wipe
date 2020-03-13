import React, { useState, useEffect } from 'react';

import ReactPixelWipe from '../components/ReactPixelWipe';

import styles from './styles.module.css';

// Constants used for generating image
const WIDTH = 1600;
const HEIGHT = 1200;
const SQUARE_WIDTH = 100;

const Example = () => {
  const [props, setProps] = useState({});
  const [options, setOptions] = useState({});
  const [arrowProps, setArrowProps] = useState({});
  const [generatedImage, setGeneratedImage] = useState('data:,');

  // Generate a png that's a grid of coloured squares
  // See `fillStyle` example from https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const squareWidth = SQUARE_WIDTH;
    const squaresWide = Math.floor(WIDTH / SQUARE_WIDTH);
    const squaresHigh = Math.floor(HEIGHT / SQUARE_WIDTH);
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < squaresWide; i += 1) {
      for (let j = 0; j < squaresHigh; j += 1) {
        const maxDim = Math.max(squaresHigh, squaresWide);
        const redValue = Math.floor(255 - (255 / maxDim) * i);
        const blueValue = Math.floor(255 - (255 / maxDim) * j);
        ctx.fillStyle = `rgb(${redValue}, 0, ${blueValue})`;
        ctx.fillRect(i * squareWidth, j * squareWidth, squareWidth, squareWidth);
      }
    }
    setGeneratedImage(canvas.toDataURL());
  }, []);

  useEffect(() => {
    const allDefaultProps = {
      isDisabled: false,
      wipeDirection: 'down',
      scaleImageTo: 'cover',
      scrollLength: '4x',
      disableAfterWipe: true,
      onAfterWipe: () => {},
      shuffleRatio: 0.1,
      contentFadeDuration: '1s',
      options: {
        boxesPerView: 2.5,
        pixelFadeIntervals: [200, 500],
        framesPerSecond: 30,
        observerThresholds: [0, 0.5, 1],
      },
      arrowProps: {
        isDisabled: false,
        color: 'pink',
        interval: 300,
        totalSteps: 13,
        containerStyle: {},
        arrowStyle: {},
      },
    };
    /* eslint-disable */
    console.log('ReactPixelWipe accepts the following props:');
    console.log('The default props of `ReactPixelWipe are:');
    console.log(allDefaultProps);
    console.log('Further explanations:');
    console.log('`scaleImageTo` keywords `cover` and `contain` behave like the CSS `background-size` properties. Use `fit` to scale to canvas.');
    console.log('`scrollLength` is a string that either ends in `px` for pixels or `x` for a factor in relation to container element height.');
    console.log('`onAfterWipe` callback fires after scrolling finished and animation complete.');
    console.log('`shuffleRatio` is between 0 (no shuffled pixels, i.e. a normal wipe), and 1 (pixels completely randomized, i.e. a pixel dissolve).');
    console.log('`contentFadeDuration` can end in `s` (seconds) or `ms` (milliseconds).');
    console.log('`options` allows control over implementation details for animation or the IntersectionObserver:');
    console.log('option `boxesPerView` specifies number of observed divs per container height.');
    console.log('option `pixelFadeIntervals` is an array of length 2 that specifies the target number of milliseconds (must be greater than 0) for first new and last new pixel to reach full opacity.');
    console.log('option `observerThresholds` is the threshold argument provided to the IntersectionObserver.');
    console.log('`arrowProps` are passed to control blinking arrows to prompt downward scroll.');
    console.log('arrow prop `interval` is the number of milliseconds used for the blink animation.');
    console.log('arrow prop `totalSteps` is number of intervals in a cycle. The arrows are only visible in the 4 final steps.');
    console.log('arrow prop `containerStyle` and `arrowStyle` are passed to the style attribute for the arrow container and the arrows themselves.');
    console.log('To change a non-object prop like `wipeDirection`, run `changeProps({ wipeDirection : "left" });`.');
    console.log('To change the `options` prop, use, e.g. `changeOptions({ pixelFadeIntervals: [1, 1000]})`');
    console.log('To disable blinking arrows, use `changeArrowProps({ isDisabled: true });`');
    /* eslint-enable */
  }, []);

  global.changeProps = (newProps) => {
    setProps((oldProps) => ({ ...oldProps, ...newProps }));
  };
  global.changeOptions = (newOptions) => {
    setOptions((oldOptions) => ({ ...oldOptions, ...newOptions }));
  };
  global.changeArrowProps = (newArrowProps) => {
    setArrowProps((oldArrowProps) => ({ ...oldArrowProps, ...newArrowProps }));
  };

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <div className={styles.fullScreen}>
      <ReactPixelWipe {...props} options={options} arrowProps={arrowProps} imgSrc={generatedImage}>
        <div className={styles.content}>
          <h1 className={styles.contentText}>
            Fin
          </h1>
        </div>
      </ReactPixelWipe>
    </div>
  );
  /* eslint-ensable react/jsx-props-no-spreading */
};

export default Example;

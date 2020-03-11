import React from 'react';
import PropTypes from 'prop-types';

import withErrorBoundary from './components/ErrorBoundary';
import ScrollObserver from './components/ScrollObserver';
import useGadgetry from './logic/useGadgetry';
import styles from './styles.module.css';

const defaultOptions = {
  boxesPerView: 2.5,
  pixelFadeIntervals: [200, 500],
  framesPerSecond: 30,
  observerThresholds: [0, 0.5, 1],
};

// TODO forward ref so that user can access content

const ReactPixelWipe = ({
  isDisabled,
  wipeDirection,
  imageSize,
  shuffleRatio,
  scrollLength,
  disableAfterWipe,
  onAfterWipe,
  contentFadeDuration,
  imgSrc,
  options,
  arrowProps,
  children,
}) => {
  const basicProps = {
    isDisabled, wipeDirection, imageSize, shuffleRatio, scrollLength, disableAfterWipe, onAfterWipe,
  };
  const mergedOptions = { ...defaultOptions, ...options };
  const {
    refCallback,
    dimensions,
    shouldRenderScrollObserver,
    totalBoxes,
    boxHeight,
    scrollProgress,
  } = useGadgetry(basicProps, mergedOptions);

  const contentStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: scrollProgress === 1 ? 1 : 0,
    transition: `opacity ${contentFadeDuration}`,
  };

  return (
    <div ref={refCallback} data-scroll-key="observer" className={styles.pixelWipeContainer}>
      <canvas ref={refCallback} className={styles.pixelWipeCanvas} />
      <div style={contentStyle}>
        {children}
      </div>
      {
        shouldRenderScrollObserver
          && (
          <ScrollObserver
            refCallback={refCallback}
            totalBoxes={totalBoxes}
            boxHeight={boxHeight}
            width={dimensions.width}
            height={dimensions.height}
            arrowProps={arrowProps}
            showArrows={scrollProgress === 0}
          />
          )
        }
      <img
        src={imgSrc}
        onLoad={({ target }) => { refCallback(target); }}
        alt="offscreen background"
        style={{ display: 'none' }}
      />
    </div>
  );
};

ReactPixelWipe.propTypes = {
  isDisabled: PropTypes.bool,
  wipeDirection: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  imageSize: PropTypes.oneOf(['cover', 'contain', 'fit']),
  scrollLength: PropTypes.string,
  disableAfterWipe: PropTypes.bool,
  onAfterWipe: PropTypes.func,
  shuffleRatio: PropTypes.number,
  contentFadeDuration: PropTypes.string,
  options: PropTypes.shape({
    boxesPerView: PropTypes.number,
    pixelFadeIntervals: PropTypes.arrayOf(PropTypes.number),
    framesPerSecond: PropTypes.number,
    observerThresholds: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
  }),
  arrowProps: PropTypes.shape({
    isDisabled: PropTypes.bool,
    color: PropTypes.string,
    interval: PropTypes.number,
    totalSteps: PropTypes.number,
    containerStyle: PropTypes.object,
    arrowStyle: PropTypes.object,
  }),
  imgSrc: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

ReactPixelWipe.defaultProps = {
  isDisabled: false,
  wipeDirection: 'down',
  imageSize: 'cover',
  scrollLength: '4x',
  disableAfterWipe: true,
  onAfterWipe: () => {},
  shuffleRatio: 0.1,
  contentFadeDuration: '1s',
  options: defaultOptions,
  arrowProps: {
    isDisabled: false,
    color: 'pink',
    interval: 300,
    totalSteps: 13,
    containerStyle: {},
    arrowStyle: {},
  },
};

export default withErrorBoundary(ReactPixelWipe);

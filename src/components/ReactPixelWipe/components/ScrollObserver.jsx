import React, { memo } from 'react';
import PropTypes from 'prop-types';

import ObservedBox from './ObservedBox';
import BlinkingArrows from './BlinkingArrows';
import styles from '../styles.module.css';

// TODO: Figure out how to allow clicks to pass through but maintain scrollability
const ScrollObserver = memo(({
  refCallback, width, height, totalBoxes, boxHeight, arrowProps,
}) => {
  const boxArray = Array(totalBoxes).fill(null);

  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  return (
    <div className={styles.scrollHider}>
      <div className={styles.scrollContent}>
        <div
          tabIndex={0}
          data-scroll-key="top"
          ref={refCallback}
          className={styles.emptyStartDiv}
          style={{ width, height }}
        >
          {
            /* eslint-disable react/jsx-props-no-spreading */
            !arrowProps.isDisabled && <BlinkingArrows {...arrowProps} />
            /* eslint-enable react/jsx-props-no-spreading */
          }
        </div>
        {
          boxArray.map((_, i) => (
            /* eslint-disable react/no-array-index-key */
            <ObservedBox key={i} scrollKey={i} refCallback={refCallback} height={boxHeight} />
            /* eslint-enable react/no-array-index-key */
          ))
        }
        <div data-scroll-key="bottom" ref={refCallback} className={styles.emptyEndDiv} style={{ width, height }} />
      </div>
    </div>
  );
  /* eslint-enable jsx-a11y/no-noninteractive-tabindex */
});

ScrollObserver.propTypes = {
  refCallback: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  totalBoxes: PropTypes.number.isRequired,
  boxHeight: PropTypes.number.isRequired,
  showArrows: PropTypes.bool.isRequired,
  arrowProps: PropTypes.shape({
    isDisabled: PropTypes.bool,
    color: PropTypes.string,
    interval: PropTypes.number,
    totalSteps: PropTypes.number,
    containerStyle: PropTypes.object,
    arrowStyle: PropTypes.object,
  }),
};

ScrollObserver.defaultProps = {
  arrowProps: {
    isDisabled: false,
    color: 'pink',
    interval: 300,
    totalSteps: 13,
    containerStyle: {},
    arrowStyle: {},
  },
};

export default ScrollObserver;

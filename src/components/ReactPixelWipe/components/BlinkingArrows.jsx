import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import styles from '../styles.module.css';

const BlinkingArrows = ({
  color, interval, totalSteps, containerStyle, arrowStyle,
}) => {
  const [blinkState, setBlinkState] = useState([false, false, false]);
  const counter = useRef(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const step = counter.current % totalSteps;
      if (step <= totalSteps - 5) setBlinkState([false, false, false]);
      else if (step === totalSteps - 4) setBlinkState([true, false, false]);
      else if (step === totalSteps - 3) setBlinkState([true, true, false]);
      else if (step === totalSteps - 2) setBlinkState([false, true, true]);
      else if (step === totalSteps - 1) setBlinkState([false, false, true]);

      counter.current += 1;
    }, interval);
    return () => window.clearInterval(intervalId);
  });

  const getClassName = (i) => `${styles.arrow}${blinkState[i] ? ` ${styles.showArrow}` : ''}`;
  const arrowStyleWithColor = { ...arrowStyle, borderTop: `70px solid ${color}` };
  return (
    <div className={styles.blinkingArrowsContainer} style={containerStyle}>
      <div className={getClassName(0)} style={arrowStyleWithColor} />
      <div className={getClassName(1)} style={arrowStyleWithColor} />
      <div className={getClassName(2)} style={arrowStyleWithColor} />
    </div>
  );
};

BlinkingArrows.propTypes = {
  color: PropTypes.string,
  interval: PropTypes.number,
  totalSteps: PropTypes.number,
  /* eslint-disable react/forbid-prop-types */
  containerStyle: PropTypes.object,
  arrowStyle: PropTypes.object,
  /* eslint-disable react/forbid-prop-types */
};

BlinkingArrows.defaultProps = {
  color: 'pink',
  interval: 300,
  totalSteps: 13,
  containerStyle: {},
  arrowStyle: {},
};

export default BlinkingArrows;

import React from 'react';
import PropTypes from 'prop-types';


const ObservedBox = ({
  refCallback, scrollKey, height,
}) => (
  <div style={{ height }} data-scroll-key={scrollKey.toString(16)} ref={refCallback} />
);


ObservedBox.propTypes = {
  refCallback: PropTypes.func.isRequired,
  scrollKey: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};


export default ObservedBox;

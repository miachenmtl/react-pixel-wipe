import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from '../styles.module.css';

class ErrorBoundary extends Component {
  state = { error: '', hasError: false };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error, hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    /* eslint-disable no-console */
    console.error(error);
    console.error(errorInfo.componentStack);
    /* eslint-enable no-console */
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <div className={styles.errorMessage}>
          <div>
            <h1>ReactPixelWipeError:</h1>
            <h2>{error.toString()}</h2>
            <h3>Stack trace in console</h3>
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

/* eslint-disable react/jsx-props-no-spreading */
const withErrorBoundary = (ChildComponent) => (
  (props) => (
    <ErrorBoundary>
      <ChildComponent {...props} />
    </ErrorBoundary>
  )
);
/* eslint-enable react/jsx-props-no-spreading */

export default withErrorBoundary;

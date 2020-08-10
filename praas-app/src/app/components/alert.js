import React from 'react';
import PropTypes from 'prop-types';

// Started with the intention of becoming a `Toast`. But for
// now this component just displays a message or hides itself.
const Alert = ({ _klass, message }) => {
  let items;

  if (message) {
    if (message === 'string' || message === 'number') {
      items = <li>{message}</li>;
    } else if (Array.isArray(message) && message.length > 0) {
      items = message.map(
        (item, index) => <li key={index}>{item}</li>
      );
    } else {
      // TODO: fix me as we make changes to backend
      items = Object.keys(message).map(
        (key, index) => <li key={index}>{message[key]}</li>
      );
    }
  }

  if (items) {
    return (
      <div>
        <ul>
          {items}
        </ul>
      </div>
    );
  } else {
    return <div style={{ display: 'none' }} />;
  }
};

Alert.propTypes = {
  klass: PropTypes.string,
  message: PropTypes.object,
};

export default Alert;

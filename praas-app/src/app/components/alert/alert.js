import React from 'react';
import PropTypes from 'prop-types';

const flash = ({ _klass, message }) => {
  let items;
  console.log('flash: ', message);
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

flash.propTypes = {
  klass: PropTypes.string,
  message: PropTypes.object,
};

export default flash;

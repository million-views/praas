import style from './header.scss';

import React from 'react';
import PropTypes from 'prop-types';

import { cx } from 'tiny';

export default function Header({ title, ...rest }) {
  return (
    <header className={cx([style.header, 'shadow'])}>
      <h1>{title}</h1>
    </header>
  );
};

Header.propTypes /* remove-proptypes */ = {
  title: PropTypes.string
};

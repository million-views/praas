import { Link } from '@reach/router';

import style from './header.scss';

import React from 'react';
import PropTypes from 'prop-types';

import { cx } from 'tiny';

const Header = ({ title, ...rest }) => {
  return (
    <header className={cx([style.header, 'shadow'])}>
      <h1>{title}</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string
};

export default Header;

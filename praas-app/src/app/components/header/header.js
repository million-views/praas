import { Link } from '@reach/router';

// import style from './header.scss';
// import './header.scss';

import React from 'react';
import PropTypes from 'prop-types';

// import { cx } from 'tiny';

const Header = ({ title, loggedIn, logout, ...rest }) => {
  if (loggedIn) {
    return (
      <header >
        <h1>{title}</h1>
        <nav>
          <Link to="logout" onClick={logout}>Logout</Link>
        </nav>
      </header>
    );
  } else {
    return (
      <header class="sticky">
        <a href="#" class="logo">Conduit</a>
        <a href="#" class="button">Home</a>
        <button>Download</button>
      </header>
    );
  }
};

Header.propTypes = {
  title: PropTypes.string,
  loggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

export default Header;

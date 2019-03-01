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
      <header >
        <h1>{title}</h1>
        <nav>
          {loggedIn && <Link to="/">Home</Link>}
          <Link to="/signup">Signup</Link>
          <Link to="/login">Login</Link>
        </nav>
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

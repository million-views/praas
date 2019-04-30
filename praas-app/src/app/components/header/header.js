import React from 'react';
import PropTypes from 'prop-types';

import { navigate } from '@reach/router';

const Header = ({ title, loggedIn, logout, ...rest }) => {
  const Menu = () => {
    if (loggedIn) {
      return (
        <div className="menu">
          <a onClick={logout} className="button icon-puzzle">Logout</a>
        </div>
      );
    } else {
      return (
        <div className="menu">
          <a onClick={() => navigate('/signup')} className="button icon-puzzle">Signup</a>
          <a onClick={() => navigate('/login')} className="button icon-puzzle">Login</a>
        </div>
      );
    }
  };

  return (
    <nav>
      <a href="#" className="brand">
        <span>{title}</span>
      </a>
      <input id="responsive-menu" type="checkbox" className="show" />
      <label htmlFor="responsive-menu" className="burger pseudo button">&#9776;</label>
      <Menu />
    </nav>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  loggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

export default Header;

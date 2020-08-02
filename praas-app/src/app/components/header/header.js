import React from 'react';
import PropTypes from 'prop-types';

import { navigate } from '@reach/router';

const Header = ({
  title = 'conduits.xyz',
  loggedIn, logout, ...rest
}) => {
  const Menu = () => {
    if (loggedIn) {
      return (
        <ul className="menu">
          <li>
            <a onClick={logout} className="icon-logout">Logout</a>
          </li>
        </ul>
      );
    } else {
      return (
        <ul className="menu">
          <li>
            <a onClick={() => navigate('/signup')} className="icon-user-add">Signup</a>
          </li>
          <li>
            <a onClick={() => navigate('/login')} className="icon-login">Login</a>
          </li>
        </ul>
      );
    }
  };

  return (
    <nav>
      <a className="brand">
        <span>{title}</span>
      </a>
      <input id="responsive-menu" type="checkbox" className="show" />
      <label htmlFor="responsive-menu" className="burger icon-menu" />
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

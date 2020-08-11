import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { logoutUser } from 'store/user/login';

const title = 'conduits.xyz';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const forPage = location.pathname;
  // console.log('location: ', location);

  // FIXME!
  // - come back and refactor this code, for now it's a poc
  const { loggedIn, isBusy } = useSelector(state => {
    const loggedIn = state.user.login.loggedIn;
    const isBusy = (
      state.user.login.inflight
    || state.user.registration.inflight
    || state.conduit.list.inflight
    || state.conduit.create.inflight
    || state.conduit.edit.inflight
    || state.conduit.del.inflight
    );
    return { loggedIn, isBusy };
  });

  // TODO:
  // - refactor this code to use a little state machine
  const Menu = () => {
    if (loggedIn) {
      return (
        <ul className="menu">
          <li>
            <a onClick={() => dispatch(logoutUser(navigate))} className="icon-logout">Logout</a>
          </li>
        </ul>
      );
    } else {
      if (forPage === '/signup') {
        return (
          <ul className="menu">
            <li>
              <a onClick={() => navigate('/login')} className="icon-login">Login</a>
            </li>
          </ul>
        );
      } else if (forPage === '/login') {
        return (
          <ul className="menu">
            <li>
              <a onClick={() => navigate('/signup')} className="icon-user-add">Signup</a>
            </li>
          </ul>
        );
      } else {
        // TODO:
        // - implement a feature to bring up a form and report this condition
        //   as a bug
        return (
          <ul className="menu">
            <li>
              <a className="icon-mail">Ooopsie, where is `{location.pathname}`</a>
            </li>
          </ul>
        );
      }
    }
  };

  const busy = isBusy && <span className="icon-spin-1 spin" />;

  return (
    <nav>
      <a className="brand">
        <span>{title}</span>{busy}
      </a>
      <input id="responsive-menu" type="checkbox" className="show" />
      <label htmlFor="responsive-menu" className="burger icon-menu" />
      <Menu />
    </nav>
  );
};

export default Header;

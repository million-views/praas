import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { logoutUser } from 'store/user/login';

const title = 'conduits.xyz';

/* eslint react/prop-types: 0 */
const MenuItem = ({ onClick, icon, label }) => {
  return (
    <li>
      <a onClick={onClick} className={icon}>
        {label}
      </a>
    </li>
  );
};

const Menu = ({ loggedIn }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const forPage = loggedIn ? 'when-logged-in' : location.pathname;
  // console.log('location: ', location, ' loggedIn: ', loggedIn, forPage);

  const menu = {
    'when-logged-in': {
      icon: 'icon-logout', label: 'Logout', go: () => dispatch(logoutUser())
    },
    '/signup': {
      icon: 'icon-login', label: 'Login', go: () => navigate('/login')
    },
    '/login': {
      icon: 'icon-user-add', label: 'Signup', go: () => navigate('/signup'),
    },
  };

  const whereTo = menu[forPage];
  // console.log('whereTo: ', whereTo);

  if (whereTo) {
    /* eslint react/jsx-handler-names: 0 */
    return (
      <ul className="menu">
        <MenuItem
          onClick={whereTo.go}
          icon={whereTo.icon} label={whereTo.label} />
      </ul>
    );
  } else {
    // TODO:
    // - implement a feature to bring up a form to report this as a bug
    return (
      <ul>
        <MenuItem>
          icon="icon-mail" label={`Ooopsie, ${location.pathname}`}
        </MenuItem>
      </ul>
    );
  }
};

function Header() {
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

  // see https://www.digitala11y.com/aria-busy-state/
  const busy = isBusy && <span
    role="progressbar"
    aria-label="loading"
    aria-live="polite" aria-busy="true"
    className="icon-spin-1 spin" />;

  return (
    <nav>
      <a className="brand">
        <span>{title}</span>{busy}
      </a>
      <input id="responsive-menu" type="checkbox" className="show" />
      <label htmlFor="responsive-menu" className="burger icon-menu" />
      <Menu loggedIn={loggedIn} />
    </nav>
  );
};

export default Header;

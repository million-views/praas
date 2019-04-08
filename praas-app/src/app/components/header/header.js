import React from 'react';
import PropTypes from 'prop-types';

import { navigate } from '@reach/router';

import { SimpleTopAppBar } from '@rmwc/top-app-bar';
import '@material/top-app-bar/dist/mdc.top-app-bar.css';

import style from './header.scss';

const Header = ({ title, loggedIn, logout, ...rest }) => {
  const actions = [];
  if (loggedIn) {
    actions.push({
      onClick: logout, icon: 'power_settings_new'
    });
  } else {
    actions.push({
      onClick: () => navigate('/signup'), icon: 'person_add'
    });
    actions.push({
      onClick: () => navigate('/login'), icon: 'exit_to_app'
    });
  }

  return (
    <SimpleTopAppBar
      className={style.header}
      fixed
      title={title}
      actionItems={actions}
    />
  );
};

Header.propTypes = {
  title: PropTypes.string,
  loggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

export default Header;

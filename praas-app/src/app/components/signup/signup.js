import React from 'react';

import style from './signup.scss';

export default () => {
  return (
    <div className={style.signup}>
      <h2>Sign up</h2>
      <input type="text" name="email" placeholder="email" />
      <input type="password" name="password" placeholder="password" />
      <button type="submit" className={style['signup-button']}>Sign up</button>
    </div>
  );
};

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { Header } from 'components';

const logit = (from, state) => {
  const { lastSetBy, mode, reason, cid } = state;
  console.log(
    `${from}: ${lastSetBy} > (${mode}, ${reason}, ${cid})`
  );
};

function Home(props) {
  const user = useSelector(state => state.user.login);
  const [state] = useState({
    lastSetBy: 'useState', mode: 'initial', reason: 'mount',
    cid: undefined
  });

  // render cycle
  logit('rc', state);

  if (!user.loggedIn) {
    return <Navigate to="/login" noThrow />;
  }

  return (
    <>
      <Header />
      <main className="page" />
    </>
  );
}

export default Home;

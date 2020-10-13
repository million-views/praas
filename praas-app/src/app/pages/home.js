import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';

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
      <main className="page">
        <Link to="conduits">
          {/*
            TODO: make this a clickable card...
            See: https://github.com/million-views/kis.css/blob/master/src/app/pages/card.js
          */}
          <button>
            Manage your conduits
          </button>
        </Link>
      </main>
    </>
  );
}

export default Home;

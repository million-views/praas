import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { Header } from 'components';
import { List as ConduitList } from './list';
import { CreateConduitForm, EditConduitForm } from './form';
import { listConduits } from 'store/conduit/list';

const logit = (from, state) => {
  const { lastSetBy, mode, reason, cid } = state;
  console.log(
    `${from}: ${lastSetBy} > (${mode}, ${reason}, ${cid})`
  );
};

function Conduit(props) {
  const user = useSelector(state => state.user.login);
  const [state, setState] = useState({
    lastSetBy: 'useState', mode: 'initial', reason: 'mount',
    cid: undefined
  });

  const dispatch = useDispatch();

  useEffect(() => {
    // use effect invoked.
    logit('ue', state);
    const { mode, reason } = state;
    const fetch = (
      user.loggedIn
    && (mode === 'list' || mode === 'initial') && reason !== 'cancel'
    );

    if (fetch) {
      dispatch(listConduits());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, user.loggedIn, dispatch]);

  // mode: list|edit|add; reason: cancel|form|refresh; cid: id|undefined
  const viewChanger = (mode, reason, cid, caller) => {
    // view changer called
    setState({ mode, reason, cid, lastSetBy: caller });
    logit('vc', state);
  };

  // render cycle
  logit('rc', state);

  if (!user.loggedIn) {
    return <Navigate to="/login" noThrow />;
  }

  let view = null;
  if (state.mode.match(/list|initial/)) {
    view = <ConduitList changeView={viewChanger} />;
  } else if (state.mode === 'add') {
    view = <CreateConduitForm changeView={viewChanger} />;
  } else if (state.mode === 'edit') {
    view = <EditConduitForm cid={state.cid} changeView={viewChanger} />;
  } else {
    // eslint-disable-next-line no-unused-vars
    view = <h1>Oops. We seem to have lost our way!</h1>;
  }

  return (
    <>
      <Header />
      <main className="page">
        {view}
      </main>
    </>
  );
}

export default Conduit;

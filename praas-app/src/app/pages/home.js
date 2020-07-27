import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect } from '@reach/router';

import { Header } from 'components';
import {
  ConduitList,
  CreateConduitForm,
  EditConduitForm
} from 'components/conduit';

import { listConduits } from 'store/conduit/list';
import { logoutUser } from 'store/user/login';

function Home({ mode = 'list', reason = 'refresh', cid = undefined }) {
  const user = useSelector(state => state.user.login);
  const [state, setState] = useState({ mode, reason, cid });
  const conduits = useSelector(state => state.conduit.list.conduits);
  const dispatch = useDispatch();
  const logout = () => dispatch(logoutUser());

  useEffect(() => {
    if (state.mode === 'list' && state.reason !== 'cancel') {
      dispatch(listConduits());
    }
  }, [state.mode, state.reason, dispatch]);

  // mode: list|edit|add; reason: cancel|form|refresh; cid: id|undefined
  const viewChanger = (mode, reason, cid) => {
    console.log('changeView:', state.mode, ' -> ', mode, reason, cid);
    setState({ mode, reason, cid });
  };

  if (!user.loggedIn) {
    return <Redirect to="login" noThrow />;
  }

  return (
    <>
      <Header loggedIn={user.loggedIn} logout={logout} />
      <main className="page">
        {state.mode === 'list' && (
          <ConduitList
            changeView={viewChanger}
            conduits={conduits}
          />
        )}
        {state.mode === 'add' && (
          <CreateConduitForm
            changeView={viewChanger}
          />
        )}
        {state.mode === 'edit' && (
          <EditConduitForm
            cid={state.cid}
            changeView={viewChanger}
          />
        )}
      </main>
    </>
  );
}

Home.propTypes = {
  mode: PropTypes.string,
  reason: PropTypes.string,
  cid: PropTypes.number,
};

export default Home;

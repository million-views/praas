import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, navigate } from '@reach/router';

import { Header } from 'components';
import {
  ConduitList,
  CreateConduitForm,
  EditConduitForm
} from 'components/conduit';

import { listConduits } from 'store/conduit/list';
import { logoutUser } from 'store/user/login';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'list',
      cid: undefined,
    };
    this.changeView = this.changeView.bind(this);
  }

  _fetchConduits() {
    const uid = this.props.user.id;
    this.props.listConduits(uid);
  }

  componentDidMount() {
    if (this.props.user.loggedIn) {
      this._fetchConduits();
    } else {
      navigate('/login');
    }
  }

  // mode: list, edit, add
  // reason: cancel, form, refresh
  // cid: conduit-id, undefined
  changeView(mode, reason, cid) {
    console.log(
      'changeView:', this.state.mode, ' -> ', mode, reason, cid)
    ;

    this.setState((_prev) => ({ mode, cid }));

    if (mode === 'list' && reason !== 'cancel') {
      this._fetchConduits();
    }
  }

  render() {
    const { user, logout } = this.props;
    if (user.loggedIn) {
      const viewChanger = (mode, reason, cid) => this.changeView(mode, reason, cid);
      return (
        <>
          <Header loggedIn={user.loggedIn} logout={logout} />
          <main className="page">
            {this.state.mode === 'list' && (
              <ConduitList
                changeView={viewChanger}
                conduits={this.props.conduits}
              />
            )}
            {this.state.mode === 'add' && (
              <CreateConduitForm
                changeView={viewChanger}
              />
            )}
            {this.state.mode === 'edit' && (
              <EditConduitForm
                cid={this.state.cid}
                changeView={viewChanger}
              />
            )}
          </main>
        </>
      );
    } else {
      return <Redirect to="login" noThrow />;
    }
  }
}

Home.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func.isRequired,
  listConduits: PropTypes.func.isRequired,
  conduits: PropTypes.arrayOf(PropTypes.object),
};

const mapStateToProps = (state, _ownProps) => {
  return {
    user: state.user.login,
    conduits: state.conduit.list.conduits,
  };
};

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(logoutUser()),
  listConduits: () => dispatch(listConduits()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);

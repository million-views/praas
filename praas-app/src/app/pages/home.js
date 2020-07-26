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
import { deleteConduit } from 'store/conduit/del';
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

  setConduitId(cid) {
    this.setState({
      cid,
    });
  }

  _fetchConduits() {
    console.log('fetching conduits....');
    const uid = this.props.user.id;
    this.props.listConduits(uid);
  }

  deleteConduit(cid) {
    console.log('--------------- cid', cid);
    this.props.deleteConduit(cid);
    this._fetchConduits();
  }

  componentDidMount() {
    if (this.props.user.loggedIn) {
      this._fetchConduits();
    } else {
      navigate('/login');
    }
  }

  changeView(mode = 'list', cid) {
    console.log('view: ', mode, ' cid:', cid);

    this.setState((prev) => ({ mode, cid: cid || prev.cid }));

    if (mode === 'list') {
      this._fetchConduits();
    }
  }

  render() {
    const { user, logout } = this.props;
    if (user.loggedIn) {
      return (
        <>
          <Header loggedIn={user.loggedIn} logout={logout} />
          <main className="page">
            {this.state.mode === 'list' && (
              <ConduitList
                changeView={(mode, cid) => this.changeView(mode, cid)}
                deleteConduit={(cid) => this.deleteConduit(cid)}
                conduits={this.props.conduits}
              />
            )}
            {this.state.mode === 'add' && (
              <CreateConduitForm changeView={(mode) => this.changeView(mode)} />
            )}
            {this.state.mode === 'edit' && (
              <EditConduitForm
                cid={this.state.cid}
                changeView={(mode, cid) => this.changeView(mode, cid)}
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
  deleteConduit: PropTypes.func,
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
  deleteConduit: (cid) => dispatch(deleteConduit(cid)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);

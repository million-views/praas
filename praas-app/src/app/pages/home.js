import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, navigate } from '@reach/router';

import { Header } from 'components';
import { ConduitList, CreateConduitForm, EditConduitForm } from 'components/conduit';

import { listConduits } from 'store/conduit/list';
import { logoutUser } from 'store/user/login';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'list',
      cid: undefined,
    };
    this.changeMode = this.changeMode.bind(this);
  }

  setConduitId(cid) {
    this.setState({
      cid
    });
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

  changeMode(mode = 'list') {
    this.setState({
      mode
    });

    if (mode === 'list') {
      this._fetchConduits();
    }
  };

  render() {
    const { user, logout } = this.props;
    if (user.loggedIn) {
      if (!this.props.conduits) {
        return (<div>Loading...</div>);
      }
      return (
        <React.Fragment>
          <Header
            loggedIn={user.loggedIn}
            logout={logout}
            title="Conduits - Pipe data in and out of your storage"
          />
          {this.state.mode === 'list' &&
            <ConduitList
              setConduitId={(cid) => this.setConduitId(cid)}
              changeMode={(mode) => this.changeMode(mode)}
              conduits={this.props.conduits} />
          }
          {this.state.mode === 'add' &&
            <CreateConduitForm
              changeMode={(mode) => this.changeMode(mode)}
            />}
          {this.state.mode === 'edit' &&
            <EditConduitForm
              cid={this.state.cid}
              changeMode={(mode) => this.changeMode(mode)}
            />}
        </React.Fragment>
      );
    } else {
      return <Redirect to="login" noThrow />;
    }
  }
};

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

const mapDispatchToProps = (dispatch) => (
  {
    logout: () => dispatch(logoutUser()),
    listConduits: () => dispatch(listConduits()),
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Home);

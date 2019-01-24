import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from '@reach/router';

import { Header } from 'components';
import { ConduitList, NewConduitForm } from 'components/conduit';

import { listConduits } from 'store/conduit/list';
import { logoutUser } from 'store/user/login';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'list',
    };
    this.changeMode = this.changeMode.bind(this);
  }

  _fetchConduits() {
    const uid = this.props.user.id;
    this.props.listConduits(uid);
  }

  componentDidMount() {
    console.log('in component did mount');
    this._fetchConduits();
  }

  changeMode(mode = 'list') {
    console.log('changed mode invoked with: ', mode);
    this.setState({
      mode
    });

    if (mode === 'list') {
      this._fetchConduits();
    }
  };

  render() {
    console.log('in rendering home', this.props);
    const { user, logout } = this.props;
    if (user.loggedIn) {
      if (!this.props.conduits) {
        return (<div>Loading...</div>);
      }
      console.log('inside else');
      return (
        <React.Fragment>
          <Header
            loggedIn={user.loggedIn}
            logout={logout}
            title="Conduits - Pipe data in and out of your storage"
          />
          {this.state.mode === 'list' &&
            <ConduitList
              changeMode={(mode) => this.changeMode(mode)}
              conduits={this.props.conduits} />
          }
          {this.state.mode === 'add' &&
            <NewConduitForm
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

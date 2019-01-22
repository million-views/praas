import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from '@reach/router';

import { Header } from 'components';
import { ConduitList, ConduitForm } from 'components/conduit';

import { logoutUser } from 'store/user/login';

function Content({ mode, changeToAddMode }) {
  console.log('mode: ', mode);
  if (mode === 'list') {
    console.log('inside list');
    return <ConduitList changeToAddMode={changeToAddMode} />;
  } else if (mode === 'add') {
    return <ConduitForm />;
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'list',
    };
    this.changeToAddMode = this.changeToAddMode.bind(this);
  }

  changeToAddMode() {
    console.log('add clicked...');
    this.setState({
      mode: 'add'
    });
  };

  render() {
    const { user, dispatch } = this.props;
    if (user.loggedIn) {
      return (
        <React.Fragment>
          <Header
            loggedIn={user.loggedIn}
            logout={() => dispatch(logoutUser())}
            title="Conduits - Pipe data in and out of your storage"
          />
          <Content mode={this.state.mode} changeToAddMode={this.changeToAddMode} />
        </React.Fragment>
      );
    } else {
      return <Redirect to="login" noThrow />;
    }
  }
};

Home.propTypes = {
  user: PropTypes.object,
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = (state, _ownProps) => {
  return {
    user: state.user.login
  };
};

export default connect(mapStateToProps)(Home);

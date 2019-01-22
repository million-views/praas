import React from 'react';
import PropTypes from 'prop-types';

import style from './list.scss';
// import { navigate } from '@reach/router/lib/history';

// const dummyConduits = [
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
//   { description: 'foo', type: 'bar', status: 'Inactive' },
// ];

const List = (props) => {
  return (
    <React.Fragment>
      <h1>List Conduits</h1>
      <h3>A conduit is a handle to a RESTful service endpoint</h3>
      <div className={style.container}>
        <button className={style.addBtn} onClick={props.changeToAddMode}>Add conduit</button>
        <h4>Description</h4>
        <h4>Type</h4>
        <h4>Status</h4>
        <h4>Action</h4>
        <span>Google Conduit</span>
        <span>Google</span>
        <span>Active</span>
        <div className={style.actionPad}>
          {/* <button onClick={navigate('/conduit/edit')}>Edit</button> */}
          <button >Edit</button>
          <button><i className="fa fa-trash" /></button>
        </div>
        <span>Air Table Conduit</span>
        <span>Airtable</span>
        <span>Active</span>
        <div className={style.actionPad}>
          <button>Edit</button>
          <button><i className="fa fa-trash" /></button>
        </div>
        <span>Smart Sheet Conduit</span>
        <span>Smartsheet</span>
        <span>Inactive</span>
        <div>
          <button>Edit</button>
          <button><i className="fa fa-trash" /></button>
        </div>
      </div>
    </React.Fragment>
  );
};

List.propTypes = {
  changeToAddMode: PropTypes.func.isRequired,
};

export default List;

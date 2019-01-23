import React from 'react';
import PropTypes from 'prop-types';

import style from './list.scss';
// import { navigate } from '@reach/router/lib/history';

const List = (props) => {
  console.log('props.conduits: ', props.conduits);

  const conduits = props.conduits.map((conduit, index) => {
    console.log('conduit: ', conduit);
    return (
      <React.Fragment key={index}>
        <span>{conduit.description}</span>
        <span>{conduit.suriType}</span>
        <span>{conduit.suri}</span>
        <span>{conduit.status}</span>
        <div className={style.actionPad}>
          {/* <button onClick={navigate('/conduit/edit')}>Edit</button> */}
          <button >Edit</button>
          <button><i className="fa fa-trash" /></button>
        </div>
      </React.Fragment>
    );
  });

  return (
    <React.Fragment>
      <h1>List Conduits</h1>
      <h3>A conduit is a handle to a RESTful service endpoint</h3>
      <div className={style.container}>
        <button className={style.addBtn} onClick={() => props.changeMode('add')}>Add conduit</button>
        <h4>Description</h4>
        <h4>Type</h4>
        <h4>Service Endpoint</h4>
        <h4>Status</h4>
        <h4>Action</h4>
        {conduits}
      </div>
    </React.Fragment>
  );
};

List.propTypes = {
  changeMode: PropTypes.func.isRequired,
  conduits: PropTypes.arrayOf(PropTypes.object),
};

export default List;

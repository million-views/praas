import React from 'react';
import PropTypes from 'prop-types';

import style from './list.scss';

const List = (props) => {
  const conduits = props.conduits.map((conduit, index) => {
    return (
      <React.Fragment key={index}>
        <span>{conduit.description}</span>
        <span>{conduit.suriType}</span>
        <span>{conduit.suri}</span>
        <span>{conduit.status}</span>
        <div className={style.actionPad}>
          <button onClick={() => { props.changeMode('edit'); props.setConduitId(conduit.id); }}>Edit</button>
          <button
            onClick={() => {
              if (window.confirm('Delete Conduit?', 'Conduit App')) {
                props.deleteConduit(conduit.id);
              }
            }}><i className="fa fa-trash" /></button>
        </div>
      </React.Fragment >
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
  setConduitId: PropTypes.func.isRequired,
  changeMode: PropTypes.func.isRequired,
  deleteConduit: PropTypes.func,
  conduits: PropTypes.arrayOf(PropTypes.object),
};

export default List;

// <button onClick={() => { props.deleteConduit(conduit.id); }}><i className="fa fa-trash" /></button>

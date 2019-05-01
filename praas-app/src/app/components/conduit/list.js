import React from 'react';
import PropTypes from 'prop-types';

// import style from './list.scss';

const List = (props) => {
  const conduits = props.conduits.map((conduit, index) => {
    return (
      <tr key={index}>
        <td>{conduit.description}</td>
        <td>{conduit.suriType}</td>
        <td>{conduit.suri}</td>
        <td>{conduit.status}</td>
        <td>
          <button onClick={() => { props.changeMode('edit'); props.setConduitId(conduit.id); }}>Edit</button>
          <button onClick={() => { props.deleteConduit(conduit.id); }}>Delete</button>
        </td>
      </tr>
    );
  });

  return (
    <React.Fragment>
      <h1>List Conduits</h1>
      <h2>A conduit is a handle to a RESTful service endpoint</h2>
      <button onClick={() => props.changeMode('add')}>Add conduit</button>
      <table className="primary">
        <thead>
          <tr>
            <th>Description</th>
            <th>Type</th>
            <th>Service Endpoint</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {conduits}
        </tbody>
      </table>
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

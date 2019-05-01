import React from 'react';
import PropTypes from 'prop-types';

const Modal = ({ deleteConduit }) => {
  return (
    <div className="modal">
      <input id="modal_1" type="checkbox" />
      <label htmlFor="modal_1" className="overlay" />
      <article>
        <header>
          <h3>Delete Confirmation Dialog</h3>
          <label htmlFor="modal_1" className="close">×</label>
        </header>
        <section className="content">
          Are you sure you want to delete?
        </section>
        <footer>
          <label htmlFor="modal_1" className="button">
            No
          </label>
          <label htmlFor="modal_1" onClick={deleteConduit} className="button dangerous">
            Yes
          </label>
        </footer>
      </article>
    </div>
  );
};

Modal.propTypes = {
  deleteConduit: PropTypes.func,
};

const List = (props) => {
  const conduits = props.conduits.map((conduit, index) => {
    const deleteConduit = () => props.deleteConduit(conduit.id);
    return (
      <tr key={index}>
        <td>{conduit.description}</td>
        <td>{conduit.suriType}</td>
        <td>{conduit.suri}</td>
        <td>{conduit.status}</td>
        <td>
          <button onClick={() => { props.changeMode('edit'); props.setConduitId(conduit.id); }}>Edit</button>
          <label htmlFor="modal_1" className="button">Delete</label>
          <Modal deleteConduit={deleteConduit} />
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

import React from 'react';
import PropTypes from 'prop-types';

// See https://uxdesign.cc/the-microcopyist-cancellation-confirmation-conflagration-8a6047a4cf9
// for an overview on writing copy for destructive actions.
const Modal = ({ deleteConduit, conduit }) => {
  console.log('===========> conduit:', conduit.id);
  return (
    <div className="modal">
      <input id="confirm-conduit-delete" type="checkbox" />
      <label htmlFor="confirm-conduit-delete" className="overlay" />
      <article>
        <header>
          <h3>Delete {conduit.curi}, (id: {conduit.id})?</h3>
          {/* <label htmlFor="confirm-conduit-delete" className="close">×</label> */}
        </header>
        <section>
          <p>
            Deleting a conduit will deactivate and remove the endpoint. You
            won't be able to access your data store using this endpoint after
            this operation. Data will remain accessible through the interface
            provided by the service provider for your data store.
          </p>
          <p>Are you sure you want to delete?</p>
        </section>
        <footer>
          <label htmlFor="confirm-conduit-delete" className="button">
            Never mind
          </label>
          <label
            htmlFor="confirm-conduit-delete"
            onClick={() => deleteConduit(conduit.id)}
            className="button dangerous"
          >
            Delete
          </label>
        </footer>
      </article>
    </div>
  );
};

Modal.propTypes = {
  deleteConduit: PropTypes.func,
  conduit: PropTypes.object
};

const List = (props) => {
  const conduits = props.conduits.map((conduit, index) => {
    return (
      <tr key={index}>
        <td>{conduit.id}</td>
        <td>{conduit.suriType}</td>
        <td>{conduit.curi}</td>
        <td>{conduit.description}</td>
        <td style={{ textTransform: 'capitalize' }}>{conduit.status}</td>
        <td style={{ display: 'flex' }}>
          <button
            onClick={() => {
              props.setConduitId(conduit.id);
              props.changeMode('edit');
            }}
            style={{ background: 0 }}
            className="icon-cog"
          />
          <label
            disabled={conduit.status === 'active'}
            htmlFor={
              conduit.status === 'inactive' ? 'confirm-conduit-delete' : null
            }
            className="button icon-trash"
            style={{ background: 0 }}
          />
          {
            conduit.status === 'inactive' &&
              <Modal deleteConduit={props.deleteConduit} conduit={conduit} />
          }
        </td>
      </tr>
    );
  });

  return (
    <>
      <h1>List Conduits</h1>
      <h2>A conduit is a handle to a RESTful service endpoint</h2>
      <button onClick={() => props.changeMode('add')}>Add conduit</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Conduit</th>
            <th>Description</th>
            <th>Status</th>
            <th style={{ textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>{conduits}</tbody>
      </table>
    </>
  );
};

List.propTypes = {
  setConduitId: PropTypes.func.isRequired,
  changeMode: PropTypes.func.isRequired,
  deleteConduit: PropTypes.func,
  conduits: PropTypes.arrayOf(PropTypes.object),
};

export default List;

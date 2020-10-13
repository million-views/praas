import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { useEventListener } from 'hooks';
import { deleteConduit } from 'store/conduit/del';

const targetTypesMap = {
  airtable: 'Airtable',
  googleSheets: 'GSheets',
  email: 'Email',
};

const handleArrowKeys = setModal => event => {
  if (event?.key === 'Escape') setModal();
};

const Modal = ({ open, setModal, conduit, changeView }) => {
  useEventListener('keydown', handleArrowKeys(setModal));
  const dispatch = useDispatch();
  const modalId = `confirm-conduit-${conduit.id}-delete`;

  return (
    <div className="modal">
      <input id={modalId} type="checkbox" readOnly checked={open} />
      <label htmlFor={modalId} className="overlay" />
      <article>
        <header>
          <h3>Delete {conduit.curi}?</h3><br />
          <h5>{conduit.id} | {targetTypesMap[conduit.suriType]} | {conduit.suriObjectKey}</h5>
          {/* <label htmlFor={modalId} className="close">×</label> */}
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
          <label htmlFor={modalId} className="button" onClick={() => setModal()}>
            Never mind
          </label>
          <label
            htmlFor={modalId}
            onClick={() => {
              dispatch(deleteConduit(conduit.id, changeView));
              setModal();
            }}
            className="button dangerous">
            Delete
          </label>
        </footer>
      </article>
    </div>
  );
};

Modal.propTypes = {
  changeView: PropTypes.func,
  conduit: PropTypes.object,
  open: PropTypes.bool,
  setModal: PropTypes.func
};

const List = (props) => {
  const [modal, setModal] = useState();
  const clist = useSelector(state => state.conduit.list);

  const handleViewChange = () => props.changeView('add', 'form', undefined, 'components/list');

  const createModal = (conduit) => {
    if (conduit.status === 'inactive') {
      return (
        <Modal
          open={conduit.id === modal}
          setModal={setModal}
          changeView={props.changeView}
          conduit={conduit} />
      );
    }
  };

  const conduits = clist.conduits.map((conduit, index) => {
    return (
      <tr key={index}>
        <td>{conduit.id}</td>
        <td>{targetTypesMap[conduit.suriType]}</td>
        <td>{conduit.curi}</td>
        <td>{conduit.description}</td>
        <td style={{ textTransform: 'capitalize' }}>{conduit.status}</td>
        <td style={{ display: 'flex' }}>
          <button
            onClick={() => {
              props.changeView('edit', 'form', conduit.id, 'components/list/row');
            }}
            style={{ background: 0 }}
            className="icon-cog" />
          <label
            disabled={conduit.status === 'active'}
            className="button icon-trash"
            style={{ background: 0 }}
            onClick={() => setModal(conduit.id)} />
          {
            createModal(conduit)
          }
        </td>
      </tr>
    );
  });

  return (
    <>
      <h1>List Conduits</h1>
      <h2>A conduit is a handle to a RESTful service endpoint</h2>
      <button
        onClick={handleViewChange}>
        Add conduit
      </button>
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
  changeView: PropTypes.func.isRequired,
};

export { List };

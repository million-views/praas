import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { deleteConduit } from 'store/conduit/del';

// See https://uxdesign.cc/the-microcopyist-cancellation-confirmation-conflagration-8a6047a4cf9
// for an overview on writing copy for destructive actions.

// const Modal = ({ open, closeModal, children }) => {
//   return (
//     <ModalBehind open={open} onClick={closeModal}>
//       <ModalDiv onClick={event => event.stopPropagation()}>
//         <Close onClick={closeModal} />
//         {children}
//       </ModalDiv>
//     </ModalBehind>
//   );
// };

// Hook from https://usehooks.com
function useEventListener(eventName, handler, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = event => savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};

const handleArrowKeys = setModal => event => {
  if (event && event.key === 'Escape') setModal();
};

const Modal = ({ open, setModal, conduit, changeView }) => {
  // console.log('===========> conduit:', conduit.id, open);
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
          <h5>{conduit.id} | {conduit.suriType} | {conduit.suriObjectKey}</h5>
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
  changeView: PropTypes.func,
  conduit: PropTypes.object,
  open: PropTypes.bool,
  setModal: PropTypes.func
};

const List = (props) => {
  const [modal, setModal] = useState();
  const clist = useSelector(state => state.conduit.list);

  const createModal = (conduit) => {
    if (conduit.status === 'inactive') {
      return (
        <Modal
          open={conduit.id === modal}
          setModal={setModal}
          changeView={props.changeView}
          conduit={conduit}
        />
      );
    }
  };

  const loading = clist.inflight && <span className="icon-spin-1 spin" />;
  const conduits = clist.conduits.map((conduit, index) => {
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
              props.changeView('edit', 'form', conduit.id, 'components/list/row');
            }}
            style={{ background: 0 }}
            className="icon-cog"
          />
          <label
            disabled={conduit.status === 'active'}
            className="button icon-trash"
            style={{ background: 0 }}
            onClick={() => setModal(conduit.id)}
          />
          {
            createModal(conduit)
          }
        </td>
      </tr>
    );
  });

  return (
    <>
      <h1>List Conduits {loading}</h1>
      <h2>A conduit is a handle to a RESTful service endpoint</h2>
      <button
        onClick={() => props.changeView('add', 'form', undefined, 'components/list')}
      >
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

export default List;

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

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

const Modal = ({ open, setModal, deleteConduit, conduit, modalId }) => {
  console.log('===========> conduit:', conduit.id, open);
  useEventListener('keydown', handleArrowKeys(setModal));
  return (
    <div className="modal" onClick={event => event.stopPropagation()}>
      <input id={modalId} type="checkbox" checked={open} />
      <label htmlFor={modalId} className="overlay" />
      <article>
        <header>
          <h3>Delete {conduit.curi}, (id: {conduit.id})?</h3>
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
  conduit: PropTypes.object,
  modalId: PropTypes.string,
  open: PropTypes.bool,
  setModal: PropTypes.func
};

const List = (props) => {
  const [modal, setModal] = useState();
  const conduits = props.conduits.map((conduit, index) => {
    const modalId = `confirm-conduit-${conduit.id}-delete`;
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
              props.changeView('edit', conduit.id);
            }}
            style={{ background: 0 }}
            className="icon-cog"
          />
          <label
            disabled={conduit.status === 'active'}
            htmlFor={
              conduit.status === 'inactive' ? { modalId } : null
            }
            className="button icon-trash"
            style={{ background: 0 }}
            onClick={() => setModal(conduit.id)}
          />
          {
            conduit.status === 'inactive' &&
              <Modal
                open={conduit.id === modal}
                setModal={setModal}
                modalId={modalId}
                deleteConduit={props.deleteConduit}
                conduit={conduit}
              />
          }
        </td>
      </tr>
    );
  });

  return (
    <>
      <h1>List Conduits</h1>
      <h2>A conduit is a handle to a RESTful service endpoint</h2>
      <button onClick={(e) => props.changeView('add', e.target.id)}>Add conduit</button>
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
  deleteConduit: PropTypes.func,
  conduits: PropTypes.arrayOf(PropTypes.object),
};

export default List;

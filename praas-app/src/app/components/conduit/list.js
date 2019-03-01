import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Modal from 'modal/Modal';
// import style from './list.scss';

const List = (props) => {
  const modal = useRef();
  const onClose = () => {
    modal.current.onClose();
  };

  const modalContent = (id, deleteConduit) => {
    return (
      <div>
        <p>Confirm to delete</p>
        <button type="button" onClick={() => { deleteConduit(id); }}>Yes</button>
        <button type="button" onClick={onClose}>No</button>
      </div>
    );
  };
  const modalProps = {
    ariaLabel: 'Delete Conduit',
    triggerText: 'This is a button to trigger the Modal'
  };
  const conduits = props.conduits.map((conduit, index) => {
    return (
      <React.Fragment key={index}>
        <span>{conduit.description}</span>
        <span>{conduit.suriType}</span>
        <span>{conduit.suri}</span>
        <span>{conduit.status}</span>
        <div>
          <button onClick={() => { props.changeMode('edit'); props.setConduitId(conduit.id); }}>Edit</button>
          <Modal {...modalProps} ref={modal}>
            {modalContent(conduit.id, props.deleteConduit)}
          </Modal>
        </div>
      </React.Fragment >
    );
  });

  return (
    <React.Fragment>
      <h1>List Conduits</h1>
      <h3>A conduit is a handle to a RESTful service endpoint</h3>
      <div>
        <button onClick={() => props.changeMode('add')}>Add conduit</button>
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

import React from 'react';

/* eslint react/prop-types: 0 */
const ModalTrigger = ({
  buttonRef,
  onOpen,
}) => <button onClick={onOpen} ref={buttonRef}><i className="fa fa-trash" /></button>;

export default ModalTrigger;

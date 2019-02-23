import React from 'react';

import style from './ModelTrigger.scss';
/* eslint react/prop-types: 0 */
const ModalTrigger = ({
  buttonRef,
  onOpen,
}) => <button className={style.cBtn} onClick={onOpen} ref={buttonRef}><i className="fa fa-trash" /></button>;

export default ModalTrigger;

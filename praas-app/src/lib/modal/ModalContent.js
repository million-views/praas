import React from 'react';
import ReactDOM from 'react-dom';
import ReactFocusTrap from './focus-trap';

import style from './ModalContent.scss';

const ModalContent = ({
  ariaLabel,
  buttonRef,
  content,
  modalRef,
  onClickAway,
  onClose,
  role = 'dialog'
}) => {
  return ReactDOM.createPortal(
    <ReactFocusTrap
      tag="aside"
      focusTrapOptions={{ onDeactivate: onClose }}
      className={style.cModalCover}
      role={role}
      aria-label={ariaLabel}
      aria-modal="true"
      onClick={onClickAway}
    >
      <div className={style.cModal} ref={modalRef}>
        <button className={style.cModalClose} aria-labelledby="close-modal" onClick={onClose} ref={buttonRef}>
          <span id="close-modal" className={style.uHideVisually}>Close Modal</span>
          <svg viewBox="0 0 40 40" className={style.cModalCloseIcon}>
            <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
          </svg>
        </button>
        <div className={style.cModalBody}>{content}</div>
      </div>
    </ReactFocusTrap>,
    document.body
  );
};

export default ModalContent;

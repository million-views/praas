import React from 'react';
import ReactDOM from 'react-dom';
import ReactFocusTrap from './focus-trap';

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
      role={role}
      aria-label={ariaLabel}
      aria-modal="true"
      onClick={onClickAway}
    >
      <div ref={modalRef}>
        <button aria-labelledby="close-modal" onClick={onClose} ref={buttonRef}>
          <span id="close-modal" >Close Modal</span>
          <svg viewBox="0 0 40 40" >
            <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
          </svg>
        </button>
        <div >{content}</div>
      </div>
    </ReactFocusTrap>,
    document.body
  );
};

export default ModalContent;

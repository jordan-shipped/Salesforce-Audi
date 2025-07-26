import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`modal ${className}`} 
        {...props}
      >
        {/* Close button */}
        <button 
          className="modal-close" 
          onClick={onClose}
        >
          ⊗
        </button>
        
        {/* Title */}
        {title && (
          <div className="modal-title">
            {title}
          </div>
        )}
        
        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, subtitle, className = '' }) => {
  return (
    <div className={`text-center mb-lg ${className}`}>
      {children}
      {subtitle && (
        <p className="text-body-regular text-text-grey-600 mt-2 mb-0">
          {subtitle}
        </p>
      )}
    </div>
  );
};

const ModalBody = ({ children, className = '' }) => {
  return (
    <div className={`mb-lg ${className}`}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className = '' }) => {
  return (
    <div className={`flex justify-end gap-md mt-xl ${className}`}>
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
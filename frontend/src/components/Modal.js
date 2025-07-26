import React from 'react';
import { colors, typography, spacing, radius, shadow, components } from '../designTokens';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.85)', // backgroundMaterial blur
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1050,
    backdropFilter: 'blur(25px)',
    WebkitBackdropFilter: 'blur(25px)',
  };

  const modalStyles = {
    background: colors.background,
    padding: components.modal.padding, // 24px top/bottom, 32px left/right
    borderRadius: components.modal.borderRadius,
    boxShadow: components.modal.boxShadow,
    width: '90%',
    maxWidth: '560px',
    position: 'relative',
    animation: 'modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const titleStyles = title ? {
    fontSize: components.modal.titleSize,
    fontWeight: components.modal.titleWeight,
    lineHeight: components.modal.titleLineHeight,
    color: colors.textPrimary,
    margin: `0 0 ${spacing.sm} 0`,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
  } : {};

  const closeButtonStyles = {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    background: 'none',
    border: 'none',
    fontSize: components.modal.closeButtonSize,
    color: components.modal.closeButtonColor,
    cursor: 'pointer',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div 
      className="apple-modal-overlay" 
      style={overlayStyles}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`apple-modal ${className}`} 
        style={modalStyles}
        {...props}
      >
        {/* Close button */}
        <button 
          className="apple-modal-close" 
          style={closeButtonStyles}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.background = colors.surfaceLight;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
          }}
        >
          ⊗
        </button>
        
        {/* Title */}
        {title && (
          <div className="apple-modal-title" style={titleStyles}>
            {title}
          </div>
        )}
        
        {/* Content */}
        <div className="apple-modal-content">
          {children}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const ModalHeader = ({ children, subtitle, className = '' }) => {
  const headerStyles = {
    textAlign: 'center',
    marginBottom: spacing.lg,
  };

  const subtitleStyles = subtitle ? {
    fontSize: typography.bodyRegular.size,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: typography.bodyRegular.lineHeight,
    margin: `${spacing.sm} 0 0 0`,
  } : {};

  return (
    <div className={`apple-modal-header ${className}`} style={headerStyles}>
      {children}
      {subtitle && (
        <p className="apple-modal-subtitle" style={subtitleStyles}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

const ModalBody = ({ children, className = '' }) => {
  const bodyStyles = {
    marginBottom: spacing.lg,
  };

  return (
    <div className={`apple-modal-body ${className}`} style={bodyStyles}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className = '' }) => {
  const footerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  };

  return (
    <div className={`apple-modal-footer ${className}`} style={footerStyles}>
      {children}
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
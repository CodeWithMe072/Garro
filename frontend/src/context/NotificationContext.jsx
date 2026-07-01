import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm', 'success', 'error', 'delete'
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null
  });

  // Toast controls
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info')
  };

  // Modal controls
  const confirm = useCallback(({
    title = 'Are you sure?',
    message = 'Please confirm this action.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDelete = false,
    onConfirm,
    onCancel
  }) => {
    setModal({
      isOpen: true,
      type: isDelete ? 'delete' : 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        setModal((m) => ({ ...m, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setModal((m) => ({ ...m, isOpen: false }));
        if (onCancel) onCancel();
      }
    });
  }, []);

  const showSuccessModal = useCallback(({
    title = 'Success!',
    message = 'Action completed successfully.',
    confirmText = 'Okay',
    onConfirm
  }) => {
    setModal({
      isOpen: true,
      type: 'success',
      title,
      message,
      confirmText,
      cancelText: '',
      onConfirm: () => {
        setModal((m) => ({ ...m, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setModal((m) => ({ ...m, isOpen: false }));
      }
    });
  }, []);

  const showErrorModal = useCallback(({
    title = 'Error!',
    message = 'An error occurred. Please try again.',
    confirmText = 'Close',
    onConfirm
  }) => {
    setModal({
      isOpen: true,
      type: 'error',
      title,
      message,
      confirmText,
      cancelText: '',
      onConfirm: () => {
        setModal((m) => ({ ...m, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setModal((m) => ({ ...m, isOpen: false }));
      }
    });
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm, showSuccessModal, showErrorModal }}>
      {children}

      {/* Render Toast Floating Container */}
      <div className="custom-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`custom-toast ${t.type}`} onClick={() => dismissToast(t.id)}>
            <div className="toast-icon">
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-content">{t.message}</div>
            <button className="toast-close">&times;</button>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>

      {/* Render Modal Overlay */}
      {modal.isOpen && (
        <div className="custom-modal-overlay" onClick={modal.onCancel}>
          <div className={`custom-modal ${modal.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              {modal.type === 'success' && '🎉'}
              {modal.type === 'error' && '⚠️'}
              {modal.type === 'delete' && '🗑️'}
              {modal.type === 'confirm' && '❓'}
            </div>
            <h3 className="modal-title">{modal.title}</h3>
            <p className="modal-message">{modal.message}</p>
            <div className="modal-actions">
              {modal.cancelText && (
                <button className="modal-btn btn-cancel" onClick={modal.onCancel}>
                  {modal.cancelText}
                </button>
              )}
              <button
                className={`modal-btn btn-confirm ${modal.type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={modal.onConfirm}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

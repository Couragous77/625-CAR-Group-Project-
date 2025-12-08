import { createContext, useContext, useState, useCallback } from 'react';
import '../styles/toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
    removeToast(id);
    }, 8000);

    
    return id;
  }, []);

 const removeToast = useCallback((id) => {
  setToasts(prev =>
    prev.map(t => t.id === id ? { ...t, exiting: true } : t)
  );

  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, 300); // match slideOut duration
}, []);


  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const showToast = useCallback((message, type = 'info') => {
    return addToast(message, type);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning, showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
          key={toast.id} 
          className={`toast toast-${toast.type} ${toast.exiting ? "exit" : ""}`}
          onClick={() => removeToast(toast.id)}
>

            <span className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

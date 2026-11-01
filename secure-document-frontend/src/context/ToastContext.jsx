import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = "info", title = "") => {
        const id = Date.now() + Math.random().toString(36).substring(2, 9);
        const newToast = { id, message, type, title };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 4.5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4500);
    }, [removeToast]);

    const getToastIcon = (type) => {
        switch (type) {
            case "success":
                return "✓";
            case "error":
                return "✕";
            case "warning":
                return "⚠️";
            case "info":
            default:
                return "ℹ️";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="toast-container" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-item toast-${toast.type}`}
                        role="alert"
                    >
                        <div className="toast-icon-badge">
                            {getToastIcon(toast.type)}
                        </div>

                        <div className="toast-content">
                            {toast.title && <div className="toast-title">{toast.title}</div>}
                            <div className="toast-message">{toast.message}</div>
                        </div>

                        <button
                            type="button"
                            className="toast-close-btn"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return context;
};

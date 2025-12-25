import React from "react";
import { useToast } from "../contexts/ToastContext";

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  return (
    <div className="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toastContent">
            <span className="toastIcon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "warning" && "⚠"}
              {toast.type === "info" && "ℹ"}
            </span>
            <span className="toastMessage">{toast.message}</span>
          </div>
          <button
            className="toastClose"
            onClick={() => hideToast(toast.id)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

"use client";

import { useToastContext } from "../context/ToastContext";
import ToastItem from "./Toast";

const ToastDisplay = () => {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastDisplay;

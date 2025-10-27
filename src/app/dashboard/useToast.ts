import { useState } from "react";

export type ToastType = "success" | "error";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}


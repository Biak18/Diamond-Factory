import { useUIStore } from "@/src/stores/uiStore";

export const showMessage = (
  message: string,
  type?: "info" | "success" | "error" | "warning",
  options?: {
    onClose?: () => void | Promise<void>;
  },
) => {
  useUIStore.getState().showMessage(message, type, options?.onClose);
};

export const showConfirm = (
  message: string,
  onConfirm: () => void | Promise<void>,
  options?: {
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  },
) => {
  useUIStore.getState().showConfirm(message, onConfirm, options);
};

export const hideMessage = () => {
  useUIStore.getState().hideMessage();
};

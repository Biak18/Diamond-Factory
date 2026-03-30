// src/store/uiStore.ts
import { create } from "zustand";

type MessageBoxType = "info" | "success" | "error" | "warning" | "confirm";

interface DialogQueueItem {
  message: string;
  type: MessageBoxType;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

interface UIState {
  message: string | null;
  type: MessageBoxType;
  show: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  queue: DialogQueueItem[];

  showMessage: (
    msg: string,
    type?: MessageBoxType,
    onClose?: () => void | Promise<void>,
  ) => void;
  showConfirm: (
    msg: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    },
  ) => void;
  hideMessage: () => void;
  processQueue: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  message: null,
  type: "info",
  show: false,
  onConfirm: undefined,
  onCancel: undefined,
  onClose: undefined,
  confirmText: "Confirm",
  cancelText: "Cancel",
  queue: [],

  showMessage: (message, type = "info", onClose) => {
    const state = get();

    if (state.show) {
      set({
        queue: [...state.queue, { message, type, onClose }],
      });
      return;
    }

    set({
      message,
      type,
      show: true,
      onConfirm: undefined,
      onCancel: undefined,
      onClose,
    });
  },

  showConfirm: (message, onConfirm, options = {}) => {
    const state = get();

    if (state.show) {
      set({
        queue: [
          ...state.queue,
          {
            message,
            type: "confirm",
            onConfirm,
            onCancel: options.onCancel,
            confirmText: options.confirmText,
            cancelText: options.cancelText,
          },
        ],
      });
      return;
    }

    set({
      message,
      type: "confirm",
      show: true,
      onConfirm,
      onCancel: options.onCancel,
      onClose: undefined,
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
    });
  },

  hideMessage: () => {
    set({
      show: false,
    });
  },

  processQueue: () => {
    const state = get();

    set({
      message: null,
      onConfirm: undefined,
      onCancel: undefined,
      onClose: undefined,
    });

    if (state.queue.length === 0) return;

    const [next, ...rest] = state.queue;

    setTimeout(() => {
      set({
        message: next.message,
        type: next.type,
        show: true,
        onConfirm: next.onConfirm,
        onCancel: next.onCancel,
        onClose: next.onClose,
        confirmText: next.confirmText || "Confirm",
        cancelText: next.cancelText || "Cancel",
        queue: rest,
      });
    }, 50);
  },
}));

// src/widgets/MessageBox.tsx
import { useUIStore } from "@/src/stores/uiStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

const MessageBox = () => {
  const {
    show,
    message,
    type,
    hideMessage,
    onConfirm,
    onCancel,
    onClose,
    confirmText,
    cancelText,
    processQueue,
  } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      setIsLoading(false);
    }
  }, [show]);

  const getIcon = () => {
    switch (type) {
      case "error":
        return { name: "close-circle", color: "#ef4444" };
      case "success":
        return { name: "checkmark-circle", color: "#2563EB" };
      case "warning":
      case "confirm":
        return { name: "warning", color: "#f59e0b" };
      default:
        return { name: "information-circle", color: "#2563EB" };
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
        hideMessage();
      } catch (error) {
        console.error("Confirm action failed:", error);
        hideMessage();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    hideMessage();
  };

  const handleOK = async () => {
    if (onClose) {
      setIsLoading(true);
      try {
        await onClose();
        hideMessage();
      } catch (error) {
        console.error("Close action failed:", error);
        hideMessage();
      }
    } else {
      hideMessage();
    }
  };

  const onModalHide = () => {
    setIsLoading(false);
    processQueue();
  };

  const icon = getIcon();
  const isConfirmDialog = type === "confirm";

  return (
    <Modal
      isVisible={show}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      animationInTiming={200}
      animationOutTiming={200}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={200}
      backdropOpacity={0.6}
      onBackdropPress={isConfirmDialog || isLoading ? undefined : handleOK}
      onModalHide={onModalHide}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View className="items-center justify-center">
        {/* Card */}
        <View className="bg-white w-[85%] rounded-3xl p-6 border border-gray-200">
          {/* Icon */}
          <View className="items-center">
            <Ionicons name={icon.name as any} size={64} color={icon.color} />
          </View>

          {/* Message */}
          <Text
            className="text-dark text-base font-medium mt-4 text-center"
            style={{ lineHeight: 24 }}
          >
            {message}
          </Text>

          {isConfirmDialog ? (
            <View className="flex-row gap-3 mt-6">
              {/* Cancel button */}
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isLoading}
                className={`flex-1 bg-surface border border-gray-200 rounded-xl py-3 ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
                <Text className="text-center text-dark/60 font-semibold text-base">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* Confirm button */}
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-red-500 rounded-xl py-3 flex-row items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-center text-white font-bold text-base">
                    {confirmText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* OK button */
            <TouchableOpacity
              onPress={handleOK}
              disabled={isLoading}
              className="mt-6 bg-primary rounded-xl py-3 flex-row items-center justify-center min-h-[48px]"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-center text-white font-bold text-base">
                  OK
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default MessageBox;

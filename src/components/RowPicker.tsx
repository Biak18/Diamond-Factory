import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

interface RowPickerProps {
  title?: string;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  optionalText?: string;
  optionalTextColor?: string;
  toArrow?: boolean;
  onPress?: () => void;
  onClear?: () => void;
  value?: string;
  nullable?: boolean;
  readonly?: boolean;
}

export interface RowPickerRef {
  setErrorMessage: (message: string) => void;
  removeErrorMessage: () => void;
}

export const RowPicker = forwardRef<RowPickerRef, RowPickerProps>(
  (
    {
      title,
      optionalText,
      optionalTextColor,
      icon,
      placeholder,
      toArrow,
      onPress,
      value,
      onClear,
      nullable,
      readonly = false,
    },
    ref,
  ) => {
    const [error, setError] = useState("");
    useImperativeHandle(ref, () => ({
      setErrorMessage(message) {
        setError(message);
      },
      removeErrorMessage: () => setError(""),
    }));
    return (
      <View className="flex-1 mb-2">
        <Text className="text-sm font-medium text-dark mb-1">
          {title}{" "}
          {optionalText && (
            <Text
              style={{ color: optionalTextColor ?? "rgb(15 23 42 / 0.3)" }}
              className="font-normal"
            >
              {optionalText}
            </Text>
          )}
          {nullable && <Text style={{ color: "#f87171" }}>*</Text>}
        </Text>
        <View className="flex-row flex-1 gap-1 items-center">
          <TouchableOpacity
            disabled={readonly}
            style={{ backgroundColor: readonly ? "#A3A3A8" : "#F8F9FA" }}
            className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 flex-1"
            activeOpacity={0.7}
            onPress={onPress}
          >
            <Ionicons name={icon} size={21} color="#2563EB" />
            <Text
              className={`flex-1 ml-3 text-lg ${
                value
                  ? "text-dark font-medium"
                  : readonly
                    ? "text-gray-100"
                    : "text-gray-400"
              }`}
              numberOfLines={1}
            >
              {value || placeholder}
            </Text>

            {value ? (
              <Pressable onPress={onClear} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            ) : (
              <Ionicons
                name="chevron-down-outline"
                size={16}
                color={readonly ? "#f3f4f6" : "#94A3B8"}
              />
            )}
          </TouchableOpacity>

          {toArrow && (
            <Ionicons name="arrow-forward-outline" size={16} color="#94A3B8" />
          )}
        </View>

        {error && (
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 14,
              color: "red",
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

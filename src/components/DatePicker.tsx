import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DatePickerProps {
  title?: string;
  nullable?: boolean;
  value: Date;
  OnDateChange: (date: Date | null) => void;
  placeholder?: string;
  getInitialDate?: (date: Date) => void;
  readonly?: boolean;
}

export interface DatePickerRef {
  setErrorMessage: (message: string) => void;
  removeErrorMessage: () => void;
}

export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(
  ({ value, nullable, title, OnDateChange, placeholder, readonly }, ref) => {
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);
    useImperativeHandle(ref, () => ({
      setErrorMessage(message) {
        setError(message);
      },
      removeErrorMessage: () => setError(""),
    }));
    return (
      <View className="flex-1">
        <Text className="text-sm font-medium text-dark mb-1">
          {title} {nullable && <Text className="text-red-400">*</Text>}
        </Text>
        <Pressable
          disabled={readonly}
          onPress={() => setShow(true)}
          style={{ backgroundColor: readonly ? "#A3A3A8" : "#F8F9FA" }}
          className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 mb-2 relative"
        >
          <Ionicons name="calendar-outline" size={20} color="#2563EB" />
          <Text
            style={{ color: value ? "black" : "#9CA3A" }}
            className="flex-1 ml-3 text-base"
          >
            {value
              ? `${value.getDate()}-${value.getMonth() + 1}-${value.getFullYear()}`
              : placeholder}
          </Text>
          {value && (
            <Pressable onPress={() => OnDateChange(null)}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </Pressable>

        <DateTimePickerModal
          isVisible={show}
          mode="date"
          date={value || new Date()}
          onConfirm={(date) => {
            setShow(false);
            OnDateChange(date);
          }}
          onCancel={() => setShow(false)}
        />
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

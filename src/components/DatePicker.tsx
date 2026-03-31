import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DatePickerProps {
  title?: string;
  nullabe?: boolean;
  value: Date;
  OnDateChange: (date: Date) => void;
  placeholder?: string;
  getInitialDate?: (date: Date) => void;
}

export interface DataPickerRef {
  setErrorMessage: (message: string) => void;
  removeErrorMessage: () => void;
}

export const DatePicker = forwardRef<DataPickerRef, DatePickerProps>(
  ({ value, nullabe, title, OnDateChange, placeholder }, ref) => {
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);
    useImperativeHandle(ref, () => ({
      setErrorMessage(message) {
        setError(message);
      },
      removeErrorMessage: () => setError(""),
    }));
    return (
      <View>
        <Text className="text-sm font-medium text-dark mb-2">
          {title} {nullabe && <Text className="text-red-400">*</Text>}
        </Text>
        <Pressable
          onPress={() => setShow(true)}
          className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-4"
        >
          <Ionicons name="calendar-outline" size={20} color="#2563EB" />
          <Text
            style={{ color: value ? "black" : "#9CA3A" }}
            className="flex-1 ml-3 text-base"
          >
            {value
              ? `${value.getDate()}-${value.getMonth() + 1}-${String(value.getFullYear())}`
              : placeholder}
          </Text>
        </Pressable>
        <DateTimePickerModal
          isVisible={show}
          mode="date"
          date={value}
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

import { Ionicons } from "@expo/vector-icons";
import { Text } from "@react-navigation/elements";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  KeyboardType,
  ReturnKeyType,
  StyleProp,
  TextInput,
  TextStyle,
  View,
} from "react-native";

interface TextBoxProps {
  value: any;
  onChange: (value: any) => void;
  title?: string;
  style?: StyleProp<TextStyle>;
  icons?: React.ComponentProps<typeof Ionicons>["name"];
  placeholder?: string;
  placeholderColor?: string;
  returnKeyType?: ReturnKeyType;
  onSubmitEditing?: () => void;
  keyboardType?: KeyboardType;
  autoCapitalize?: "words" | "none" | "sentences" | "characters" | undefined;
  nullable?: boolean;
  optionalText?: string;
  optionalTextColor?: string;
  readonly?: boolean;
}

export interface TextBoxRef {
  setErrorMessage: (message: string) => void;
  removeErrorMessage: () => void;
  focus: () => void;
}

export const TextBox = forwardRef<TextBoxRef, TextBoxProps>(
  (
    {
      value,
      onChange,
      title,
      style,
      icons,
      placeholder,
      placeholderColor,
      returnKeyType,
      onSubmitEditing,
      keyboardType,
      autoCapitalize,
      nullable = false,
      optionalText,
      optionalTextColor = "rgb(15 23 42 / 0.3)",
      readonly,
    },
    ref,
  ) => {
    const [errorMes, setErrorMes] = useState("");
    const inputRef = React.useRef<TextInput>(null);
    useImperativeHandle(ref, () => ({
      setErrorMessage(message) {
        setErrorMes(message);
      },
      removeErrorMessage: () => setErrorMes(""),
      focus: () => inputRef.current?.focus(),
    }));
    return (
      <View className="mb-4">
        <Text style={{ fontFamily: "Inter", fontSize: 13, marginBottom: 3 }}>
          {title}{" "}
          {optionalText && (
            <Text style={{ color: optionalTextColor }}>{optionalText}</Text>
          )}{" "}
          {nullable && <Text style={{ color: "#f87171" }}>*</Text>}
        </Text>
        <View
          style={{ backgroundColor: readonly ? "#A3A3A8" : "#F8F9FA" }}
          className="flex-row items-center border border-gray-200 rounded-xl px-4 gap-2 h-14"
        >
          {icons && <Ionicons name={icons} size={20} color="#2563EB" />}
          {readonly ? (
            <Text style={{ fontSize: 16 }}>{placeholder || value}</Text>
          ) : (
            <TextInput
              style={style}
              ref={inputRef}
              className="flex-1 text-base text-dark"
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              value={value}
              keyboardType={keyboardType}
              onChangeText={onChange}
              autoCapitalize={autoCapitalize}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
            />
          )}
        </View>
        {errorMes && (
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: 14,
              color: "red",
            }}
          >
            {errorMes}
          </Text>
        )}
      </View>
    );
  },
);

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
import { IconButton } from "./IconButton";

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
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  eyeIcon?: boolean;
  eyeIconClick?: () => void;
  eyeIconState?: React.ComponentProps<typeof Ionicons>["name"];
  multiline?: boolean;
  numberOfLines?: number;
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
      placeholderColor = "#94A3B8",
      returnKeyType,
      onSubmitEditing,
      keyboardType,
      autoCapitalize,
      nullable = false,
      optionalText,
      optionalTextColor = "rgb(15 23 42 / 0.3)",
      readonly = false,
      autoCorrect,
      secureTextEntry,
      eyeIcon = false,
      eyeIconState,
      eyeIconClick,
      multiline,
      numberOfLines,
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
      <View className="flex-1 mb-4">
        <Text style={{ fontFamily: "Inter", fontSize: 13, marginBottom: 3 }}>
          {title}{" "}
          {optionalText && (
            <Text style={{ color: optionalTextColor }}>{optionalText}</Text>
          )}{" "}
          {nullable && <Text style={{ color: "#f87171" }}>*</Text>}
        </Text>
        <View
          style={{ backgroundColor: readonly ? "#A3A3A8" : "#F8F9FA" }}
          className="flex-row items-center border border-gray-200 rounded-xl px-4 gap-2"
        >
          {icons && <Ionicons name={icons} size={20} color="#2563EB" />}
          <View className="relative w-full">
            <TextInput
              readOnly={readonly}
              multiline={multiline}
              numberOfLines={numberOfLines}
              autoCorrect={autoCorrect}
              style={style}
              ref={inputRef}
              secureTextEntry={secureTextEntry}
              className="flex-1 text-base text-dark"
              placeholder={placeholder}
              placeholderTextColor={readonly ? "white" : placeholderColor}
              value={value}
              keyboardType={keyboardType}
              onChangeText={onChange}
              autoCapitalize={autoCapitalize}
              returnKeyType={returnKeyType}
              onSubmitEditing={onSubmitEditing}
            />

            {eyeIcon && (
              <IconButton
                onClick={eyeIconClick}
                size={20}
                style={{
                  position: "absolute",
                  right: 12,
                  transform: [{ translateY: "10%" }], // ✅ center it
                }}
                icon={eyeIconState ?? "eye"}
                iconColor="#6B7280"
                backgroundColor="transparent"
              />
            )}
          </View>
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

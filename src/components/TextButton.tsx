import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
interface ButtonProps {
  text: string;
  backgroundColor?: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}

export const TextButton = ({
  text,
  backgroundColor,
  onClick,
  loading,
  disabled,
  style,
  icon,
}: ButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      className="px-4 py-3 h-14 rounded-xl"
      onPress={onClick}
      style={[
        {
          backgroundColor: (backgroundColor ?? loading) ? "#7a9eeb" : "#2563EB",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <Ionicons name={icon} size={18} color="white" />}
          <Text
            style={{ fontSize: 16.5 }}
            className="text-white text-center font-semibold ml-2"
          >
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

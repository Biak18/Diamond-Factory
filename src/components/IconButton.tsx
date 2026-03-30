import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
interface ButtonProps {
  backgroundColor?: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
}

export const IconButton = ({
  backgroundColor,
  onClick,
  loading = false,
  disabled,
  style,
  icon,
  iconColor = "whtie",
}: ButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      className="w-12 h-12 rounded-xl items-center justify-center"
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
        <Ionicons name={icon} size={28} color={iconColor} />
      )}
    </Pressable>
  );
};

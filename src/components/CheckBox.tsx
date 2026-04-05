import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface CheckBoxProps {
  text?: string;
  onCheck?: (value: boolean) => void;
  value: boolean;
  optionalText?: string;
}

export const CheckBox = ({
  text,
  onCheck,
  value,
  optionalText,
}: CheckBoxProps) => {
  return (
    <View className="flex-row items-center mb-2">
      <Pressable onPress={() => onCheck?.(!value)}>
        <Ionicons name={value ? "checkbox" : "checkbox-outline"} size={23} />
      </Pressable>
      <Text className="text-sm font-medium  ml-1">{text}</Text>{" "}
      {optionalText && (
        <Text className="text-sm ml-1 text-dark/40">{optionalText}</Text>
      )}
    </View>
  );
};

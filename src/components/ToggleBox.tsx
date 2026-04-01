import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ToggleProps {
  title?: string;
  nullable?: boolean;
  data?: string[];
  onChange?: (value?: string) => void;
  value?: string;
  currency?: boolean;
}

export const ToggleBox = ({
  title,
  nullable,
  data,
  onChange,
  value,
  currency,
}: ToggleProps) => {
  const [selectedItem, setSelectedItem] = useState(value);
  function currencyFilter(type: string) {
    switch (type) {
      case "USD":
        return "🇺🇸 USD";
      case "INR":
        return "🇮🇳 INR";
    }
  }
  return (
    <View className="flex-1">
      <Text className="text-sm font-medium text-dark mb-2">
        {title} {nullable && <Text className="text-red-400">*</Text>}
      </Text>
      <View className="flex-row bg-surface rounded-xl p-1 mb-4">
        {data?.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2 ${
              selectedItem === item ? "bg-primary" : ""
            }`}
            onPress={() => {
              setSelectedItem(item);
              onChange?.(selectedItem);
            }}
          >
            <Text
              className={`text-base font-bold ${
                selectedItem === item ? "text-white" : "text-dark/40"
              }`}
            >
              {currency ? currencyFilter(item) : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

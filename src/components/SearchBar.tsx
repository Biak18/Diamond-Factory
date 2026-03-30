import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

interface SearchBarProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
}
export const SearchBar = ({ value, onChange, placeholder }: SearchBarProps) => {
  return (
    <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12 mt-4">
      <Ionicons name="search-outline" size={18} color="#94A3B8" />
      <TextInput
        className="flex-1 ml-2 text-base text-dark"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange("")}>
          <Ionicons name="close-circle" size={18} color="#94A3B8" />
        </Pressable>
      )}
    </View>
  );
};

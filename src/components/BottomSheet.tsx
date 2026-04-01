import { Ionicons } from "@expo/vector-icons";
import { Portal } from "@gorhom/portal";
import { useEffect } from "react";
import {
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal hostName="bottomsheet">
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "flex-end",
        }}
      >
        {/* Backdrop */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onPress={onClose}
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 40,
            maxHeight: SCREEN_HEIGHT * 0.92,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 48,
              height: 4,
              backgroundColor: "#E2E8F0",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          {/* Title row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_700Bold",
                color: "#0F172A",
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle-outline" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Portal>
  );
}

import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) setError(error.message);
    console.log("Sign-in error:", error);
    setLoading(false);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={10}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
              <Ionicons name="cube-outline" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-dark">Family Stock</Text>
            <Text className="text-base text-gray-500 mt-1">
              Manage your shop inventory
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-dark mb-6">Sign In</Text>

            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center gap-2">
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#EF4444"
                />
                <Text className="text-red-500 text-sm flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Text className="text-sm font-medium text-dark mb-2">Email</Text>
              <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-dark mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSignIn}
              disabled={loading}
              className="bg-primary h-14 rounded-xl items-center justify-center active:opacity-80"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-bold">Sign In</Text>
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-base text-gray-500">No account yet? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="text-base font-bold text-primary">
                  Sign Up
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

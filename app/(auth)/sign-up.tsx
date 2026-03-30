import { supabase } from "@/src/lib/supabase";
import {
  showConfirm as showConfirmMsg,
  showMessage,
} from "@/src/lib/utils/dialog";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Basic validation
    if (!name.trim()) {
      showMessage("Please enter your name.", "warning");
      return;
    }
    if (!email.trim()) {
      showMessage("Please enter your email.", "warning");
      return;
    }
    if (password.length < 6) {
      showMessage("Password must be at least 6 characters.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "warning");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to sign up with email:", email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      showConfirmMsg(
        "Account Created! Your account is ready. Please sign in.",
        () => router.replace("/(auth)/sign-in"),
        {
          confirmText: "Go to Sign In",
        },
      );
    } catch (err: any) {
      showMessage(err.message || "Could not create account.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={10}
      >
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Header */}
          <View className="mb-10">
            <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
              <Ionicons name="storefront-outline" size={32} color="white" />
            </View>
            <Text className="text-3xl text-dark font-bold">Create Account</Text>
            <Text className="text-base text-dark/60 mt-1">
              Set up your family shop account
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Name */}
            <View>
              <Text className="text-sm font-medium text-dark mb-2">
                Full Name
              </Text>
              <View className="flex-row items-center bg-white border border-dark/10 rounded-xl px-4 h-14">
                <Ionicons name="person-outline" size={20} color="#2563EB" />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark font-sans"
                  placeholder="e.g. John Smith"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-dark mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-dark/10 rounded-xl px-4 h-14">
                <Ionicons name="mail-outline" size={20} color="#2563EB" />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark font-sans"
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-dark mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-white border border-dark/10 rounded-xl px-4 h-14">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#2563EB"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark font-sans"
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-medium text-dark mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-white border border-dark/10 rounded-xl px-4 h-14">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#2563EB"
                />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark font-sans"
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`mt-8 h-14 rounded-xl items-center justify-center ${
              loading ? "bg-primary/60" : "bg-primary"
            }`}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-bold">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-base text-dark/60">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
              <Text className="text-base text-primary font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

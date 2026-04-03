import { TextBox, TextBoxRef } from "@/src/components/TextBox";
import { TextButton } from "@/src/components/TextButton";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const emailInput = useRef<TextBoxRef>(null);
  const passInput = useRef<TextBoxRef>(null);

  const handleSignIn = async () => {
    if (!email) {
      emailInput.current?.setErrorMessage("Please enter your email here.");
      return;
    } else if (!password) {
      passInput.current?.setErrorMessage("Please enter your password here.");
      emailInput.current?.removeErrorMessage();
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) setError(error.message);
    console.log("Sign-in error:", error);
    emailInput.current?.removeErrorMessage();
    passInput.current?.removeErrorMessage();
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
            {/*Email Input*/}
            <TextBox
              ref={emailInput}
              value={email}
              readonly={loading}
              onChange={setEmail}
              placeholder="your@email.com"
              placeholderColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              icons="mail-outline"
              title="Email"
              autoCorrect={false}
            />
            {/*Password Input*/}
            <TextBox
              ref={passInput}
              title="Password"
              icons="lock-closed-outline"
              value={password}
              readonly={loading}
              onChange={setPassword}
              placeholder="••••••••"
              placeholderColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              eyeIcon
              eyeIconClick={() => setShowPassword(!showPassword)}
              eyeIconState={showPassword ? "eye-outline" : "eye-off-outline"}
            />
            <TextButton
              text="Sign In"
              loading={loading}
              onClick={handleSignIn}
              disabled={loading}
            />
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-base text-gray-500">No account yet? </Text>
            <Link href="/(auth)/sign-up" replace asChild>
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

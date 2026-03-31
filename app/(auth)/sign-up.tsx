import { TextBox, TextBoxRef } from "@/src/components/TextBox";
import { TextButton } from "@/src/components/TextButton";
import { supabase } from "@/src/lib/supabase";
import {
  showConfirm as showConfirmMsg,
  showMessage,
} from "@/src/lib/utils/dialog";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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

  const nameRef = useRef<TextBoxRef>(null);
  const emailRef = useRef<TextBoxRef>(null);
  const passRef = useRef<TextBoxRef>(null);
  const comPassRef = useRef<TextBoxRef>(null);

  const handleSignUp = async () => {
    // Basic validation
    if (!name.trim()) {
      nameRef.current?.setErrorMessage("Please enter your name.");
      expectRemoveMessage("name");
      return;
    }
    if (!email.trim()) {
      emailRef.current?.setErrorMessage("Please enter your email.");
      expectRemoveMessage("email");
      return;
    }
    if (!password.trim()) {
      passRef.current?.setErrorMessage("Please enter your password.");
      expectRemoveMessage("pass");
      return;
    }
    if (password.length < 6) {
      passRef.current?.setErrorMessage(
        "Password must be at least 6 characters.",
      );
      expectRemoveMessage("pass");
      return;
    }
    if (!confirmPassword.trim()) {
      comPassRef.current?.setErrorMessage(
        "Please enter your confirm password.",
      );
      expectRemoveMessage("comPass");
      return;
    }
    if (password !== confirmPassword) {
      comPassRef.current?.setErrorMessage("Passwords do not match.");
      expectRemoveMessage("comPass");
      return;
    }
    expectRemoveMessage("all");

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

  const expectRemoveMessage = (
    type: "name" | "email" | "pass" | "comPass" | "all",
  ) => {
    switch (type) {
      case "name": {
        emailRef.current?.removeErrorMessage();
        passRef.current?.removeErrorMessage();
        comPassRef.current?.removeErrorMessage();
        break;
      }
      case "email": {
        nameRef.current?.removeErrorMessage();
        passRef.current?.removeErrorMessage();
        comPassRef.current?.removeErrorMessage();
        break;
      }
      case "comPass": {
        emailRef.current?.removeErrorMessage();
        passRef.current?.removeErrorMessage();
        nameRef.current?.removeErrorMessage();
        break;
      }
      case "pass": {
        emailRef.current?.removeErrorMessage();
        nameRef.current?.removeErrorMessage();
        comPassRef.current?.removeErrorMessage();
        break;
      }
      case "all": {
        passRef.current?.removeErrorMessage();
        emailRef.current?.removeErrorMessage();
        nameRef.current?.removeErrorMessage();
        comPassRef.current?.removeErrorMessage();
        break;
      }
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

          {/* Name */}
          <TextBox
            ref={nameRef}
            placeholder="e.g. John Smith"
            placeholderColor="#94A3B8"
            value={name}
            onChange={setName}
            autoCapitalize="words"
            icons="person-outline"
            title="Full Name"
            style={{ backgroundColor: "white" }}
          />

          {/* Email */}
          <TextBox
            ref={emailRef}
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderColor="#94A3B8"
            icons="mail-outline"
            title="Email Address"
            style={{ backgroundColor: "white" }}
          />

          {/* Password */}
          <TextBox
            ref={passRef}
            value={password}
            onChange={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholder="Min. 6 characters"
            placeholderColor="#94A3B8"
            icons="lock-closed-outline"
            title="Password"
            eyeIcon
            eyeIconClick={() => setShowPassword(!showPassword)}
            eyeIconState={showPassword ? "eye-outline" : "eye-off-outline"}
            style={{ backgroundColor: "white" }}
          />

          {/* Confirm Password */}
          <TextBox
            ref={comPassRef}
            value={confirmPassword}
            onChange={setConfirmPassword}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            placeholder="Re-enter your password"
            icons="lock-closed-outline"
            title="Confrim Password"
            eyeIcon
            style={{ backgroundColor: "white" }}
            eyeIconClick={() => setShowConfirm(!showConfirm)}
            eyeIconState={showConfirm ? "eye-outline" : "eye-off-outline"}
          />

          {/* Sign Up Button */}
          <TextButton
            text="Create Account"
            loading={loading}
            onClick={handleSignUp}
            disabled={loading}
          />

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

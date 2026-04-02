import BottomSheet from "@/src/components/BottomSheet";
import { supabase } from "@/src/lib/supabase";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//  Info Row
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={16} color="#2563EB" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-dark/40">{label}</Text>
        <Text className="text-base font-medium text-dark mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

//  Edit Name Modal
function EditNameModal({
  visible,
  currentName,
  onClose,
  onSaved,
}: {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const { user, setProfile, profile } = useAuthStore();

  const handleSave = async () => {
    if (!name.trim()) {
      showMessage("Name cannot be empty.", "error");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("id", user?.id);

    if (error) {
      showMessage(error.message, "error");
    } else {
      setProfile({ ...profile!, name: name.trim() });
      onSaved(name.trim());
      onClose();
    }
    setSaving(false);
  };

  return (
    <BottomSheet visible={visible} title="Edit Name" onClose={onClose}>
      <Text className="text-sm font-medium text-dark mb-2">Full Name</Text>
      <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-8">
        <Ionicons name="person-outline" size={20} color="#2563EB" />
        <TextInput
          className="flex-1 ml-3 text-base text-dark"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
      </View>

      <TouchableOpacity
        className={`h-14 rounded-xl items-center justify-center mb-2 ${
          saving ? "bg-primary/60" : "bg-primary"
        }`}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-bold">Save</Text>
        )}
      </TouchableOpacity>
    </BottomSheet>
  );
}

//  Profile Screen
export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    showConfirm(
      "Are you sure you want to sign out?",
      async () => {
        setSigningOut(true);
        await signOut();
        setSigningOut(false);
      },
      {
        confirmText: "Sign Out",
      },
    );

    // Alert.alert("Sign Out", "Are you sure you want to sign out?", [
    //   { text: "Cancel", style: "cancel" },
    //   {
    //     text: "Sign Out",
    //     style: "destructive",
    //     onPress: async () => {
    //       setSigningOut(true);
    //       await signOut();
    //       setSigningOut(false);
    //     },
    //   },
    // ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-6 border-b border-gray-100">
        <Text className="text-2xl font-bold text-dark">Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl px-6 py-6 items-center shadow-sm">
          {/* Avatar circle */}
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-white">
              {profile?.name ? getInitials(profile.name) : "?"}
            </Text>
          </View>

          <Text className="text-xl font-bold text-dark">
            {profile?.name ?? "—"}
          </Text>
          <Text className="text-sm text-dark/40 mt-1">
            {profile?.email ?? "—"}
          </Text>

          {/* Edit name button */}
          <TouchableOpacity
            className="mt-4 flex-row items-center gap-2 bg-primary/10 px-5 py-2.5 rounded-full"
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={16} color="#2563EB" />
            <Text className="text-sm font-medium text-primary">Edit Name</Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl px-4 shadow-sm">
          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={profile?.name ?? "—"}
          />
          <InfoRow
            icon="mail-outline"
            label="Email Address"
            value={profile?.email ?? "—"}
          />
          <InfoRow
            icon="calendar-outline"
            label="Member Since"
            value={joinedDate}
          />
        </View>

        {/* App info card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl px-4 shadow-sm">
          <View className="flex-row items-center py-3 border-b border-gray-100">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="storefront-outline" size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-dark/40">App</Text>
              <Text className="text-base font-medium text-dark mt-0.5">
                Family Stock
              </Text>
            </View>
          </View>
          <View className="flex-row items-center py-3">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="code-slash-outline" size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-dark/40">Version</Text>
              <Text className="text-base font-medium text-dark mt-0.5">
                1.0.0
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className={`mx-4 mt-6 h-14 rounded-xl items-center justify-center flex-row gap-2 ${
            signingOut ? "bg-red-300" : "bg-red-500"
          }`}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold">Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Name Modal */}
      <EditNameModal
        visible={editModalVisible}
        currentName={profile?.name ?? ""}
        onClose={() => setEditModalVisible(false)}
        onSaved={(name) => console.log("Name updated:", name)}
      />
    </View>
  );
}

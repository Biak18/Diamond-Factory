import { Supplier, useSupplierStore } from "@/src/stores/useSupplierStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// ─── Add Supplier Modal ───────────────────────────────────────────
function AddSupplierModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addSupplier } = useSupplierStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);

  const phoneRef = useRef<TextInput>(null);
  const companyRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter supplier name.");
      return;
    }
    setSaving(true);
    try {
      await addSupplier({
        name: name.trim(),
        phone: phone.trim() || undefined,
        company_name: companyName.trim() || undefined,
      });
      handleClose();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setCompanyName("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={handleClose} />

        <View className="bg-white rounded-t-3xl px-6 pt-4 pb-10">
          {/* Handle bar */}
          <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-5" />

          {/* Title */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-dark">Add Supplier</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close-circle-outline" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={80}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <Text className="text-sm font-medium text-dark mb-2">
              Name <Text className="text-red-400">*</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-4">
              <Ionicons name="person-outline" size={20} color="#2563EB" />
              <TextInput
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. John Smith"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>

            {/* Phone */}
            <Text className="text-sm font-medium text-dark mb-2">
              Phone <Text className="text-dark/30 font-normal">(optional)</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-4">
              <Ionicons name="call-outline" size={20} color="#2563EB" />
              <TextInput
                ref={phoneRef}
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. +91 9876543210"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => companyRef.current?.focus()}
              />
            </View>

            {/* Company Name */}
            <Text className="text-sm font-medium text-dark mb-2">
              Company Name{" "}
              <Text className="text-dark/30 font-normal">(optional)</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-8">
              <Ionicons name="business-outline" size={20} color="#2563EB" />
              <TextInput
                ref={companyRef}
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. Diamond Trading Co."
                placeholderTextColor="#9CA3AF"
                value={companyName}
                onChangeText={setCompanyName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Save */}
            <TouchableOpacity
              className={`h-14 rounded-xl items-center justify-center ${
                saving ? "bg-primary/60" : "bg-primary"
              }`}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Save Supplier
                </Text>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Supplier Card ────────────────────────────────────────────────
function SupplierCard({
  supplier,
  onDelete,
}: {
  supplier: Supplier;
  onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Supplier",
      `Are you sure you want to delete "${supplier.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(supplier.id),
        },
      ],
    );
  };

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm">
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
          <Text className="text-lg font-bold text-primary">
            {supplier.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-bold text-dark">{supplier.name}</Text>
          {supplier.company_name && (
            <Text className="text-sm text-dark/50 mt-0.5">
              {supplier.company_name}
            </Text>
          )}
          {supplier.phone && (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Ionicons name="call-outline" size={12} color="#94A3B8" />
              <Text className="text-sm text-dark/40">{supplier.phone}</Text>
            </View>
          )}
        </View>

        {/* Delete */}
        <Pressable
          onPress={handleDelete}
          className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Suppliers Screen ─────────────────────────────────────────────
export default function SuppliersScreen() {
  const { suppliers, isLoading, fetchSuppliers, deleteSupplier } =
    useSupplierStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search),
  );

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">Suppliers</Text>
            <Text className="text-sm text-dark/50 mt-0.5">
              {suppliers.length} supplier
              {suppliers.length !== 1 ? "s" : ""} total
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 bg-primary rounded-xl items-center justify-center"
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12 mt-4">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-base text-dark"
            placeholder="Search suppliers..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchSuppliers}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => (
            <SupplierCard supplier={item} onDelete={deleteSupplier} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="people-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                {search ? "No suppliers found" : "No suppliers yet"}
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                {search
                  ? "Try a different search"
                  : "Tap + to add your first supplier"}
              </Text>
            </View>
          }
        />
      )}

      <AddSupplierModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

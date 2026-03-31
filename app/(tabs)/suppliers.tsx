import { IconButton } from "@/src/components/IconButton";
import { SearchBar } from "@/src/components/SearchBar";
import { TextBox, TextBoxRef } from "@/src/components/TextBox";
import { TextButton } from "@/src/components/TextButton";
import { Supplier, useSupplierStore } from "@/src/stores/useSupplierStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
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

  const nameInputRef = useRef<TextBoxRef>(null);
  const phoneRef = useRef<TextBoxRef>(null);
  const companyRef = useRef<TextBoxRef>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      nameInputRef.current?.setErrorMessage("Please enter supplier name.");
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
      nameInputRef.current?.removeErrorMessage();
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

  // const translateY = useRef(new Animated.Value(0)).current;

  // const panResponder = PanResponder.create({
  //   onStartShouldSetPanResponder: () => true,
  //   onPanResponderMove: (_, gestureState) => {
  //     // Only allow dragging down
  //     if (gestureState.dy > 0) {
  //       translateY.setValue(gestureState.dy);
  //     }
  //   },
  //   onPanResponderRelease: (_, gestureState) => {
  //     if (gestureState.dy > 300) {
  //       Animated.timing(translateY, {
  //         toValue: 500,
  //         duration: 200,
  //         useNativeDriver: true,
  //       }).start(() => {
  //         setTimeout(() => {
  //           translateY.setValue(0); // reset after went off
  //         }, 100);
  //         handleClose();
  //       });
  //     } else {
  //       // Snap back
  //       Animated.spring(translateY, {
  //         toValue: 0,
  //         useNativeDriver: true,
  //       }).start();
  //     }
  //   },
  // });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={handleClose} />

        <Animated.View
          // style={{
          //   transform: [{ translateY }],
          // }}
          className="bg-white rounded-t-3xl px-6 pt-4 pb-10"
        >
          {/* Handle bar */}
          <View
            // {...panResponder.panHandlers}
            className="w-full h-12 absolute top-0 self-center"
          >
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center" />
          </View>

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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <TextBox
              ref={nameInputRef}
              title="Name"
              nullable={true}
              icons="person-outline"
              value={name}
              onChange={setName}
              readonly={saving}
              placeholder="e.g. John Smith"
              placeholderColor="#9CA3AF"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />

            {/* Phone */}
            <TextBox
              ref={phoneRef}
              title="Phone"
              optionalText="(optional)"
              icons="call-outline"
              readonly={saving}
              value={phone}
              onChange={setPhone}
              placeholder="e.g. +95 9876543210"
              placeholderColor="#9CA3AF"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => companyRef.current?.focus()}
            />

            {/* Company Name */}
            <TextBox
              ref={companyRef}
              title="Company Name"
              optionalText="(optional)"
              icons="business-outline"
              placeholder="e.g. Diamond Trading Co."
              placeholderColor="#9CA3AF"
              value={companyName}
              onChange={setCompanyName}
              autoCapitalize="words"
              readonly={saving}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            {/* Save */}
            <TextButton
              onClick={handleSave}
              disabled={saving}
              loading={saving}
              text="Save Supplier"
            />
          </KeyboardAwareScrollView>
        </Animated.View>
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

          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="call-outline" size={12} color="#94A3B8" />
            <Text className="text-sm text-dark/40">
              {supplier.phone ?? "Unknow number"}
            </Text>
          </View>
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
          <IconButton
            icon="add"
            iconColor="white"
            onClick={() => setModalVisible(true)}
          />
        </View>

        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search suppliers..."
        />
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

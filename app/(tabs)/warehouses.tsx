import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { useWarehouseStore } from "@/src/stores/useWarehouseStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

//  Add Warehouse Modal
function AddWarehouseModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addWarehouse } = useWarehouseStore();
  const [whCode, setWhCode] = useState("");
  const [whName, setWhName] = useState("");
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<TextInput>(null);

  const handleSave = async () => {
    if (!whCode.trim()) {
      showMessage("Please enter a warehouse code.", "warning");
      return;
    }
    if (!whName.trim()) {
      showMessage("Please enter a warehouse name.", "warning");
      return;
    }
    setSaving(true);
    try {
      await addWarehouse({
        wh_code: whCode.trim().toUpperCase(),
        wh_name: whName.trim(),
      });
      setWhCode("");
      setWhName("");
      onClose();
    } catch (err: any) {
      showMessage(
        err?.message?.includes("unique")
          ? "Warehouse code already exists."
          : err?.message || "Could not save warehouse.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setWhCode("");
    setWhName("");
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

          {/* Title row */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-dark">
              Add New Warehouse
            </Text>
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
            {/* Warehouse Code */}
            <Text className="text-sm font-medium text-dark mb-2">
              Warehouse Code <Text className="text-red-400">*</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-4">
              <Ionicons name="code-slash-outline" size={20} color="#2563EB" />
              <TextInput
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. WH-001"
                placeholderTextColor="#9CA3AF"
                value={whCode}
                onChangeText={setWhCode}
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => nameRef.current?.focus()}
              />
            </View>

            {/* Warehouse Name */}
            <Text className="text-sm font-medium text-dark mb-2">
              Warehouse Name <Text className="text-red-400">*</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-8">
              <Ionicons name="business-outline" size={20} color="#2563EB" />
              <TextInput
                ref={nameRef}
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. Main Storage"
                placeholderTextColor="#9CA3AF"
                value={whName}
                onChangeText={setWhName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>

            {/* Save Button */}
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
                  Save Warehouse
                </Text>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

//  Warehouse Card
function WarehouseCard({
  warehouse,
  onDelete,
}: {
  warehouse: { id: string; wh_code: string; wh_name: string };
  onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    showConfirm(
      `Are you sure you want to delete "${warehouse.wh_name}"?`,
      () => onDelete(warehouse.id),
      {
        confirmText: "Delete",
      },
    );

    // Alert.alert(
    //   "Delete Warehouse",
    //   `Are you sure you want to delete "${warehouse.wh_name}"?`,
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: () => onDelete(warehouse.id),
    //     },
    //   ],
    // );
  };

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 flex-row items-center shadow-sm">
      {/* Icon */}
      <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
        <Ionicons name="business-outline" size={24} color="#2563EB" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-bold text-dark">
          {warehouse.wh_name}
        </Text>
        <Text className="text-sm text-dark/50 mt-0.5">{warehouse.wh_code}</Text>
      </View>

      {/* Delete */}
      <Pressable
        onPress={handleDelete}
        className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </Pressable>
    </View>
  );
}

//  Warehouses Screen
export default function WarehousesScreen() {
  const { warehouses, isLoading, fetchWarehouses, deleteWarehouse } =
    useWarehouseStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filtered = warehouses.filter(
    (w) =>
      w.wh_name.toLowerCase().includes(search.toLowerCase()) ||
      w.wh_code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">Warehouses</Text>
            <Text className="text-sm text-dark/50 mt-0.5">
              {warehouses.length} warehouse
              {warehouses.length !== 1 ? "s" : ""} total
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
            placeholder="Search warehouses..."
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
          contentContainerStyle={{
            padding: 16,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchWarehouses}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => (
            <WarehouseCard warehouse={item} onDelete={deleteWarehouse} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="business-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                {search ? "No warehouses found" : "No warehouses yet"}
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                {search
                  ? "Try a different search"
                  : "Tap + to add your first warehouse"}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal */}
      <AddWarehouseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

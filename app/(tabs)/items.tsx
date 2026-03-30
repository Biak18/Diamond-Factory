import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { useItemStore } from "@/src/stores/useItemStore";
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

function AddItemModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addItem } = useItemStore();
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const handleSave = async () => {
    if (!itemCode.trim()) {
      showMessage("Please enter an item code.", "warning");
      nameRef.current?.focus();
      return;
    }
    if (!itemName.trim()) {
      showMessage("Please enter an item name.", "warning");
      nameRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      await addItem({
        item_code: itemCode.trim().toUpperCase(),
        item_name: itemName.trim(),
      });
      setItemCode("");
      setItemName("");
      onClose();
    } catch (err: any) {
      showMessage(
        err?.message?.includes("unique")
          ? "Item code already exists."
          : err?.message || "Could not save item.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setItemCode("");
    setItemName("");
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
            <Text className="text-xl font-bold text-dark">Add New Item</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close-circle-outline" size={28} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            ref={scrollRef}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={120}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Item Code */}
            <Text className="text-sm font-medium text-dark mb-2">
              Item Code <Text className="text-red-400">*</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-4">
              <Ionicons name="barcode-outline" size={20} color="#2563EB" />
              <TextInput
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. ITEM-001"
                placeholderTextColor="#9CA3AF"
                value={itemCode}
                onChangeText={setItemCode}
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => nameRef.current?.focus()}
                onFocus={() => scrollRef.current?.scrollToPosition(0, 0, true)}
              />
            </View>

            {/* Item Name */}
            <Text className="text-sm font-medium text-dark mb-2">
              Item Name <Text className="text-red-400">*</Text>
            </Text>
            <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-8">
              <Ionicons name="pricetag-outline" size={20} color="#2563EB" />
              <TextInput
                ref={nameRef}
                className="flex-1 ml-3 text-base text-dark"
                placeholder="e.g. Rice Bag 5kg"
                placeholderTextColor="#9CA3AF"
                value={itemName}
                onChangeText={setItemName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                onFocus={() =>
                  scrollRef.current?.scrollToPosition(0, 100, true)
                }
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
                  Save Item
                </Text>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ItemCard({
  item,
  onDelete,
}: {
  item: { id: string; item_code: string; item_name: string };
  onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    showConfirm(
      `Are you sure you want to delete "${item.item_name}"?`,
      () => onDelete(item.id),
      {
        confirmText: "Delete",
      },
    );

    // Alert.alert(
    //   "Delete Item",
    //   `Are you sure you want to delete "${item.item_name}"?`,
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Delete",
    //       style: "destructive",
    //       onPress: () => onDelete(item.id),
    //     },
    //   ],
    // );
  };

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 flex-row items-center shadow-sm">
      <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
        <Ionicons name="cube-outline" size={24} color="#2563EB" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-bold text-dark">{item.item_name}</Text>
        <Text className="text-sm text-dark/50 mt-0.5">{item.item_code}</Text>
      </View>

      <Pressable
        onPress={handleDelete}
        className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </Pressable>
    </View>
  );
}

export default function ItemsScreen() {
  const { items, isLoading, fetchItems, deleteItem } = useItemStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter(
    (i) =>
      i.item_name.toLowerCase().includes(search.toLowerCase()) ||
      i.item_code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">Items</Text>
            <Text className="text-sm text-dark/50 mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""} total
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
            placeholder="Search items..."
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
              onRefresh={fetchItems}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => (
            <ItemCard item={item} onDelete={deleteItem} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="cube-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                {search ? "No items found" : "No items yet"}
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                {search
                  ? "Try a different search"
                  : "Tap + to add your first item"}
              </Text>
            </View>
          }
        />
      )}

      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

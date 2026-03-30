import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useItemStore } from "@/src/stores/useItemStore";
import { useTransactionStore } from "@/src/stores/useTransactionStore";
import { useWarehouseStore } from "@/src/stores/useWarehouseStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//  Helpers
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number) =>
  price.toLocaleString("en-US", { minimumFractionDigits: 2 });

//  Picker Row
function PickerRow({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-dark mb-2">
        {label} <Text className="text-red-400">*</Text>
      </Text>
      <TouchableOpacity
        className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={label === "Item" ? "cube-outline" : "business-outline"}
          size={20}
          color="#2563EB"
        />
        <Text
          className={`flex-1 ml-3 text-base ${
            value ? "text-dark" : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
}

//  Select Modal
function SelectModal<T extends { id: string }>({
  visible,
  title,
  data,
  labelKey,
  subKey,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  data: T[];
  labelKey: keyof T;
  subKey: keyof T;
  onSelect: (item: T) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((d) =>
    String(d[labelKey]).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        className="bg-white rounded-t-3xl px-6 pt-4"
        style={{ maxHeight: "60%" }}
      >
        <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-4" />
        <Text className="text-lg font-bold text-dark mb-4">{title}</Text>

        {/* Search */}
        <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12 mb-3">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-base text-dark"
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center py-3 border-b border-gray-100"
              onPress={() => {
                onSelect(item);
                setSearch("");
                onClose();
              }}
            >
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <Ionicons
                  name={
                    title.includes("Item") ? "cube-outline" : "business-outline"
                  }
                  size={20}
                  color="#2563EB"
                />
              </View>
              <View>
                <Text className="text-base font-medium text-dark">
                  {String(item[labelKey])}
                </Text>
                <Text className="text-sm text-dark/50">
                  {String(item[subKey])}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {filtered.length === 0 && (
            <View className="items-center py-10">
              <Text className="text-base text-dark/40">No results found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

//  Add Transaction Modal
function AddTransactionModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addTransaction } = useTransactionStore();
  const { items, fetchItems } = useItemStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const { user } = useAuthStore();

  const [fgSlip, setFgSlip] = useState<1 | 2>(1);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    item_name: string;
    item_code: string;
  } | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<{
    id: string;
    wh_name: string;
    wh_code: string;
  } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showWhPicker, setShowWhPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchItems();
      fetchWarehouses();
    }
  }, [visible]);

  const resetForm = () => {
    setFgSlip(1);
    setSelectedItem(null);
    setSelectedWarehouse(null);
    setQuantity("");
    setUnitPrice("");
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!selectedItem) {
      showMessage("Please select an item.", "warning");
      return;
    }
    if (!selectedWarehouse) {
      showMessage("Please select a warehouse.", "warning");
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      showMessage("Please enter a valid quantity.", "warning");
      return;
    }
    if (unitPrice && isNaN(Number(unitPrice))) {
      showMessage("Please enter a valid unit price.", "warning");
      return;
    }
    if (!user?.id) {
      showMessage("User session not found.", "error");
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        item_id: selectedItem.id,
        warehouse_id: selectedWarehouse.id,
        fg_slip: fgSlip,
        quantity: Number(quantity),
        unit_price: Number(unitPrice) || 0,
        note: note.trim() || undefined,
        created_by: user.id,
      });
      handleClose();
    } catch (err: any) {
      showMessage(err?.message || "Could not save transaction.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={handleClose} />

          <View
            className="bg-white rounded-t-3xl px-6 pt-4 pb-10"
            style={{ maxHeight: "90%" }}
          >
            {/* Handle bar */}
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-5" />

            {/* Title */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-dark">
                New Transaction
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons
                  name="close-circle-outline"
                  size={28}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              enableOnAndroid={true}
              enableAutomaticScroll={true}
              extraScrollHeight={80}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* IN / OUT Toggle */}
              <Text className="text-sm font-medium text-dark mb-2">
                Type <Text className="text-red-400">*</Text>
              </Text>
              <View className="flex-row bg-surface rounded-xl p-1 mb-4">
                <TouchableOpacity
                  className={`flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2 ${
                    fgSlip === 1 ? "bg-primary" : ""
                  }`}
                  onPress={() => setFgSlip(1)}
                >
                  <Ionicons
                    name="arrow-down-circle-outline"
                    size={20}
                    color={fgSlip === 1 ? "white" : "#94A3B8"}
                  />
                  <Text
                    className={`text-base font-bold ${
                      fgSlip === 1 ? "text-white" : "text-dark/40"
                    }`}
                  >
                    IN
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2 ${
                    fgSlip === 2 ? "bg-primary" : ""
                  }`}
                  onPress={() => setFgSlip(2)}
                >
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={20}
                    color={fgSlip === 2 ? "white" : "#94A3B8"}
                  />
                  <Text
                    className={`text-base font-bold ${
                      fgSlip === 2 ? "text-white" : "text-dark/40"
                    }`}
                  >
                    OUT
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Item Picker */}
              <PickerRow
                label="Item"
                value={
                  selectedItem
                    ? `${selectedItem.item_name} (${selectedItem.item_code})`
                    : ""
                }
                placeholder="Select an item"
                onPress={() => setShowItemPicker(true)}
              />

              {/* Warehouse Picker */}
              <PickerRow
                label="Warehouse"
                value={
                  selectedWarehouse
                    ? `${selectedWarehouse.wh_name} (${selectedWarehouse.wh_code})`
                    : ""
                }
                placeholder="Select a warehouse"
                onPress={() => setShowWhPicker(true)}
              />

              {/* Quantity + Price row */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-dark mb-2">
                    Quantity <Text className="text-red-400">*</Text>
                  </Text>
                  <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14">
                    <Ionicons name="layers-outline" size={20} color="#2563EB" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-dark"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-medium text-dark mb-2">
                    Unit Price
                  </Text>
                  <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14">
                    <Ionicons name="cash-outline" size={20} color="#2563EB" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-dark"
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      value={unitPrice}
                      onChangeText={setUnitPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Note */}
              <Text className="text-sm font-medium text-dark mb-2">
                Note{" "}
                <Text className="text-dark/30 font-normal">(optional)</Text>
              </Text>
              <View className="bg-surface border border-gray-200 rounded-xl px-4 py-3 mb-8">
                <TextInput
                  className="text-base text-dark"
                  placeholder="e.g. Received from supplier"
                  placeholderTextColor="#9CA3AF"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={2}
                  style={{ minHeight: 56 }}
                />
              </View>

              {/* Save */}
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
                  <Text className="text-white text-base font-bold">
                    Save Transaction
                  </Text>
                )}
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>

      {/* Item Picker */}
      <SelectModal
        visible={showItemPicker}
        title="Select Item"
        data={items}
        labelKey="item_name"
        subKey="item_code"
        onSelect={(item) => setSelectedItem(item as any)}
        onClose={() => setShowItemPicker(false)}
      />

      {/* Warehouse Picker */}
      <SelectModal
        visible={showWhPicker}
        title="Select Warehouse"
        data={warehouses}
        labelKey="wh_name"
        subKey="wh_code"
        onSelect={(wh) => setSelectedWarehouse(wh as any)}
        onClose={() => setShowWhPicker(false)}
      />
    </>
  );
}

//  Transaction Card
function TransactionCard({ tx }: { tx: any }) {
  const isIn = tx.fg_slip === 1;

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm">
      {/* Top row */}
      <View className="flex-row items-center justify-between mb-2">
        {/* IN/OUT badge */}
        <View
          className={`px-3 py-1 rounded-full ${
            isIn ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              isIn ? "text-green-600" : "text-red-500"
            }`}
          >
            {isIn ? "▼ IN" : "▲ OUT"}
          </Text>
        </View>

        {/* Date */}
        <Text className="text-xs text-dark/40">
          {formatDate(tx.created_at)}
        </Text>
      </View>

      {/* Item name */}
      <Text className="text-base font-bold text-dark">
        {tx.items?.item_name ?? "—"}
      </Text>
      <Text className="text-sm text-dark/50 mt-0.5">
        {tx.items?.item_code} · {tx.warehouses?.wh_name}
      </Text>

      {/* Qty + Price row */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="flex-row items-center gap-1">
          <Ionicons name="layers-outline" size={15} color="#2563EB" />
          <Text className="text-sm font-medium text-dark">
            Qty:{" "}
            <Text className={isIn ? "text-green-600" : "text-red-500"}>
              {isIn ? "+" : "-"}
              {tx.quantity}
            </Text>
          </Text>
        </View>

        <Text className="text-sm text-dark/50">
          @ {formatPrice(tx.unit_price)}
        </Text>

        <Text className="text-sm font-bold text-dark">
          = {formatPrice(tx.quantity * tx.unit_price)}
        </Text>
      </View>

      {/* Note + created by */}
      {(tx.note || tx.profiles?.name) && (
        <View className="mt-2 pt-2 border-t border-gray-100 flex-row items-center justify-between">
          <Text className="text-xs text-dark/40 flex-1">
            {tx.note ? `📝 ${tx.note}` : ""}
          </Text>
          <Text className="text-xs text-dark/30">
            {tx.profiles?.name ?? ""}
          </Text>
        </View>
      )}
    </View>
  );
}

//  Transactions Screen
export default function TransactionsScreen() {
  const { transactions, isLoading, fetchTransactions } = useTransactionStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (filter === "in") return tx.fg_slip === 1;
    if (filter === "out") return tx.fg_slip === 2;
    return true;
  });

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">Transactions</Text>
            <Text className="text-sm text-dark/50 mt-0.5">
              {transactions.length} record
              {transactions.length !== 1 ? "s" : ""} total
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

        {/* Filter tabs */}
        <View className="flex-row gap-2 mt-4">
          {(["all", "in", "out"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-full border ${
                filter === f
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === f ? "text-white" : "text-dark/50"
                }`}
              >
                {f === "all" ? "All" : f === "in" ? "▼ IN" : "▲ OUT"}
              </Text>
            </TouchableOpacity>
          ))}
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
              onRefresh={fetchTransactions}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => <TransactionCard tx={item} />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons
                name="swap-horizontal-outline"
                size={56}
                color="#CBD5E1"
              />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                {filter !== "all" ? "No records found" : "No transactions yet"}
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                {filter !== "all"
                  ? "Try a different filter"
                  : "Tap + to record your first transaction"}
              </Text>
            </View>
          }
        />
      )}

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

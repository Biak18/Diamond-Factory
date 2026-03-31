import { RowPicker, RowPickerRef } from "@/src/components/RowPicker";
import { TextBox, TextBoxRef } from "@/src/components/TextBox";
import { TextButton } from "@/src/components/TextButton";
import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { usePackageStore } from "@/src/stores/usePackageStore";
import { Purchase, usePurchaseStore } from "@/src/stores/usePurchaseStore";
import { useSupplierStore } from "@/src/stores/useSupplierStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ─── Helpers ──────────────────────────────────────────────────────
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });

// ─── Generic Picker Modal ─────────────────────────────────────────
function PickerModal<T extends { id: string }>({
  visible,
  title,
  data,
  labelKey,
  subKey,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  data: T[];
  labelKey: keyof T;
  subKey?: keyof T;
  selected: T | null;
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
          {filtered.map((item) => {
            const isSelected = selected?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center py-3 px-2 rounded-xl mb-1 ${
                  isSelected ? "bg-primary/10" : ""
                }`}
                onPress={() => {
                  onSelect(item);
                  setSearch("");
                  onClose();
                }}
              >
                <View className="flex-1">
                  <Text
                    className={`text-base font-medium ${isSelected ? "text-primary" : "text-dark"}`}
                  >
                    {String(item[labelKey])}
                  </Text>
                  {subKey && item[subKey] && (
                    <Text className="text-sm text-dark/40 mt-0.5">
                      {String(item[subKey])}
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>
            );
          })}
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

// ─── Picker Row ───────────────────────────────────────────────────
function PickerRow({
  label,
  value,
  placeholder,
  icon,
  required,
  onPress,
  onClear,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  required?: boolean;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-dark mb-2">
        {label}{" "}
        {required ? (
          <Text className="text-red-400">*</Text>
        ) : (
          <Text className="text-dark/30 font-normal">(optional)</Text>
        )}
      </Text>
      <TouchableOpacity
        className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name={icon as any} size={20} color="#2563EB" />
        <Text
          className={`flex-1 ml-3 text-base ${value ? "text-dark" : "text-gray-400"}`}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        {value ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down-outline" size={18} color="#94A3B8" />
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Add Purchase Modal ───────────────────────────────────────────
function AddPurchaseModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addPurchase } = usePurchaseStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { packages, fetchPackages } = usePackageStore();
  const { user } = useAuthStore();
  const pkgCodeRef = useRef<TextBoxRef>(null);
  const pkgNameRef = useRef<TextBoxRef>(null);
  // Form state
  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: string;
    name: string;
    company_name?: string;
  } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    package_code: string;
    package_name: string;
  } | null>(null);
  const [weightCt, setWeightCt] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("USD");
  const [pricePerCt, setPricePerCt] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // Picker visibility
  const [showSupplierPicker, setShowSupplierPicker] = useState(false);
  const [showPackagePicker, setShowPackagePicker] = useState(false);

  const weightRef = useRef<TextBoxRef>(null);
  const priceRef = useRef<TextBoxRef>(null);
  const exchangeRef = useRef<TextBoxRef>(null);

  const supplierRef = useRef<RowPickerRef>(null);
  const packageRef = useRef<RowPickerRef>(null);

  // Auto calculate total

  const totalPrice = useMemo(() => {
    const weight = Number(weightCt);
    const price = Number(pricePerCt);
    const rate = Number(exchangeRate);

    if (isNaN(weight) || isNaN(price)) return 0;

    if (rate > 0) {
      // return weight * price * rate; // convert to MMK
      return price * rate; // keep in USD or INR, just show MMK in UI
    }

    // return weight * price; // stay in USD or INR
    return price; // show price per CT since exchange rate is not provided
  }, [weightCt, pricePerCt, exchangeRate]);

  useEffect(() => {
    if (visible) {
      fetchSuppliers();
      fetchPackages();
    }
  }, [visible]);

  const resetForm = () => {
    setSelectedSupplier(null);
    setSelectedPackage(null);
    setWeightCt("");
    setCurrency("USD");
    setPricePerCt("");
    setExchangeRate("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!selectedSupplier) {
      supplierRef.current?.setErrorMessage("Please select a suppiler");
      packageRef.current?.removeErrorMessage();
      return;
    }
    if (!selectedPackage) {
      packageRef.current?.setErrorMessage("Please select a package.");
      supplierRef.current?.removeErrorMessage();
      return;
    }
    if (!weightCt || isNaN(Number(weightCt)) || Number(weightCt) <= 0) {
      weightRef.current?.setErrorMessage("Please enter a valid weight in CT.");
      priceRef.current?.removeErrorMessage();
      packageRef.current?.removeErrorMessage();
      supplierRef.current?.removeErrorMessage();
      return;
    }
    if (!pricePerCt || isNaN(Number(pricePerCt)) || Number(pricePerCt) <= 0) {
      priceRef.current?.setErrorMessage("Please enter a valid price per CT.");
      weightRef.current?.removeErrorMessage();
      packageRef.current?.removeErrorMessage();
      supplierRef.current?.removeErrorMessage();
      return;
    }
    if (!purchaseDate) {
      Alert.alert("Missing Info", "Please enter a purchase date.");
      weightRef.current?.removeErrorMessage();
      priceRef.current?.removeErrorMessage();
      packageRef.current?.removeErrorMessage();
      supplierRef.current?.removeErrorMessage();
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User session not found.");
      weightRef.current?.removeErrorMessage();
      priceRef.current?.removeErrorMessage();
      packageRef.current?.removeErrorMessage();
      supplierRef.current?.removeErrorMessage();
      return;
    }

    setSaving(true);
    try {
      await addPurchase({
        supplier_id: selectedSupplier.id,
        package_id: selectedPackage.id,
        weight_ct: Number(weightCt),
        currency,
        price_per_ct: Number(pricePerCt),
        total_price: totalPrice,
        exchange_rate: exchangeRate ? Number(exchangeRate) : undefined,
        purchase_date: purchaseDate,
        note: note.trim() || undefined,
        created_by: user.id,
      });
      handleClose();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not save purchase.");
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
            style={{ maxHeight: "95%" }}
          >
            <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-dark">New Purchase</Text>
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
              {/* Supplier */}
              <RowPicker
                ref={supplierRef}
                readonly={saving}
                nullable
                value={
                  selectedSupplier
                    ? selectedSupplier.company_name
                      ? `${selectedSupplier.name} · ${selectedSupplier.company_name}`
                      : selectedSupplier.name
                    : ""
                }
                title="Supplier"
                placeholder="Select a supplier"
                icon="people-outline"
                onPress={() => setShowSupplierPicker(true)}
                onClear={() => setSelectedSupplier(null)}
              />

              {/* Package */}
              <RowPicker
                ref={packageRef}
                readonly={saving}
                nullable
                value={
                  selectedPackage
                    ? `${selectedPackage.package_code} · ${selectedPackage.package_name}`
                    : ""
                }
                title="Package"
                icon="layers-outline"
                placeholder="Select a package"
                onPress={() => setShowPackagePicker(true)}
                onClear={() => setSelectedPackage(null)}
              />

              {/* Weight CT */}
              <TextBox
                readonly={saving}
                ref={weightRef}
                title="Weight"
                icons="scale-outline"
                value={weightCt}
                onChange={setWeightCt}
                keyboardType="decimal-pad"
                placeholder="e.g. 100.000"
                placeholderColor="#9CA3AF"
                nullable
                optionalText="(CT)"
                optionalTextColor="black"
              />

              {/* Currency Toggle */}
              <Text className="text-sm font-medium text-dark mb-2">
                Currency <Text className="text-red-400">*</Text>
              </Text>
              <View className="flex-row bg-surface rounded-xl p-1 mb-4">
                {(["USD", "INR"] as const).map((c) => (
                  <TouchableOpacity
                    key={c}
                    className={`flex-1 h-12 rounded-xl items-center justify-center flex-row gap-2 ${
                      currency === c ? "bg-primary" : ""
                    }`}
                    onPress={() => setCurrency(c)}
                  >
                    <Text
                      className={`text-base font-bold ${
                        currency === c ? "text-white" : "text-dark/40"
                      }`}
                    >
                      {c === "USD" ? "🇺🇸 USD" : "🇮🇳 INR"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price per CT + Exchange Rate */}
              <View className="flex-row gap-3 mb-4">
                <TextBox
                  readonly={saving}
                  ref={priceRef}
                  title="Price / CT"
                  value={pricePerCt}
                  onChange={setPricePerCt}
                  placeholder="0.00"
                  placeholderColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  icons="cash-outline"
                  nullable
                />
                <TextBox
                  readonly={saving}
                  ref={exchangeRef}
                  title="Exchange Rate"
                  optionalText="(opt)"
                  value={exchangeRate}
                  onChange={setExchangeRate}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  icons="swap-horizontal-outline"
                />
              </View>

              {/* Total Price — auto calculated */}
              <View className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4">
                <Text className="text-xs text-primary/70 mb-1">
                  Total Price (auto calculated)
                </Text>
                <Text className="text-2xl font-bold text-primary">
                  {Number(exchangeRate) > 0
                    ? "K " // MMK symbol
                    : currency === "USD"
                      ? "$ "
                      : "₹ "}
                  {formatNumber(totalPrice)}
                </Text>
                {weightCt && pricePerCt && (
                  <Text className="text-xs text-primary/50 mt-1">
                    {/* {Number(exchangeRate) > 0
                      ? `${weightCt} CT × ${currency === "USD" ? "$" : "₹"}${pricePerCt} × ${exchangeRate} (MMK rate)`
                      : `${weightCt} CT × ${currency === "USD" ? "$" : "₹"}${pricePerCt} / CT`} */}

                    {Number(exchangeRate) > 0
                      ? `${currency === "USD" ? "$" : "₹"}${pricePerCt} × ${exchangeRate} (MMK rate)`
                      : `${currency === "USD" ? "$" : "₹"}${pricePerCt} / CT`}
                  </Text>
                )}
              </View>

              {/* Purchase Date */}
              <Text className="text-sm font-medium text-dark mb-2">
                Purchase Date <Text className="text-red-400">*</Text>
              </Text>
              <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14 mb-4">
                <Ionicons name="calendar-outline" size={20} color="#2563EB" />
                <TextInput
                  className="flex-1 ml-3 text-base text-dark"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  keyboardType="numeric"
                />
              </View>

              {/* Note */}
              <TextBox
                value={note}
                readonly={saving}
                multiline
                placeholder="e.g. Purchased from Mumbai supplier"
                placeholderColor="#9CA3AF"
                numberOfLines={2}
                style={{ minHeight: 75 }}
                onChange={setNote}
                title="Note"
                optionalText="(optional)"
              />

              {/* Save */}
              <TextButton
                text="Save Purchase"
                onClick={handleSave}
                disabled={saving}
                loading={saving}
              />
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>

      {/* Supplier Picker */}
      <PickerModal
        visible={showSupplierPicker}
        title="Select Supplier"
        data={suppliers}
        labelKey="name"
        subKey="company_name"
        selected={selectedSupplier}
        onSelect={(s) => setSelectedSupplier(s as any)}
        onClose={() => setShowSupplierPicker(false)}
      />

      {/* Package Picker */}
      <PickerModal
        visible={showPackagePicker}
        title="Select Package"
        data={packages}
        labelKey="package_code"
        subKey="package_name"
        selected={selectedPackage}
        onSelect={(p) => setSelectedPackage(p as any)}
        onClose={() => setShowPackagePicker(false)}
      />
    </>
  );
}

// ─── Purchase Card ────────────────────────────────────────────────
function PurchaseCard({ purchase }: { purchase: Purchase }) {
  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm">
      {/* Top row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-xs font-bold text-primary">
            {purchase.purchase_code}
          </Text>
        </View>
        <Text className="text-xs text-dark/40">
          {formatDate(purchase.purchase_date)}
        </Text>
      </View>

      {/* Supplier + Package */}
      <Text className="text-base font-bold text-dark">
        {purchase.suppliers?.name ?? "—"}
      </Text>
      <Text className="text-sm text-dark/50 mt-0.5">
        {purchase.suppliers?.company_name &&
          `${purchase.suppliers.company_name} · `}
        Package: {purchase.diamond_packages?.package_code ?? "—"}
      </Text>

      {/* Weight + Price row */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="items-center">
          <Text className="text-xs text-dark/40">Weight</Text>
          <Text className="text-sm font-bold text-dark mt-0.5">
            {purchase.weight_ct} CT
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-xs text-dark/40">Price / CT</Text>
          <Text className="text-sm font-bold text-dark mt-0.5">
            {purchase.currency === "USD" ? "$" : "₹"}
            {formatNumber(purchase.price_per_ct)}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-xs text-dark/40">Total</Text>
          <Text className="text-sm font-bold text-primary mt-0.5">
            {purchase.exchange_rate && purchase.exchange_rate > 0
              ? `K ${formatNumber(purchase.total_price)}`
              : purchase.currency === "USD"
                ? `$ ${formatNumber(purchase.total_price)}`
                : `₹ ${formatNumber(purchase.total_price)}`}
          </Text>
        </View>

        {/* Currency badge */}
        <View
          className={`px-2 py-1 rounded-full ${
            purchase.currency === "USD" ? "bg-green-100" : "bg-orange-100"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              purchase.currency === "USD" ? "text-green-600" : "text-orange-500"
            }`}
          >
            {purchase.currency}
          </Text>
        </View>
      </View>

      {/* Exchange rate + note + created by */}
      {(purchase.exchange_rate || purchase.note || purchase.profiles?.name) && (
        <View className="mt-2 pt-2 border-t border-gray-100">
          {purchase.exchange_rate && (
            <Text className="text-xs text-dark/40">
              💱 Rate: {purchase.exchange_rate}
            </Text>
          )}
          {purchase.note && (
            <Text className="text-xs text-dark/40 mt-0.5">
              📝 {purchase.note}
            </Text>
          )}
          {purchase.profiles?.name && (
            <Text className="text-xs text-dark/30 mt-0.5 text-right">
              by {purchase.profiles.name}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Purchases Screen ─────────────────────────────────────────────
export default function PurchasesScreen() {
  const { purchases, isLoading, fetchPurchases } = usePurchaseStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<"ALL" | "USD" | "INR">(
    "ALL",
  );

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filtered = purchases.filter((p) => {
    const matchSearch =
      p.suppliers?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.diamond_packages?.package_code
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.purchase_code.toLowerCase().includes(search.toLowerCase());
    const matchCurrency =
      currencyFilter === "ALL" || p.currency === currencyFilter;
    return matchSearch && matchCurrency;
  });

  // Totals
  const totalUSD = purchases
    .filter((p) => p.currency === "USD")
    .reduce((sum, p) => sum + p.price_per_ct, 0);
  const totalINR = purchases
    .filter((p) => p.currency === "INR")
    .reduce((sum, p) => sum + p.price_per_ct, 0);

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">Purchases</Text>
            <Text className="text-sm text-dark/50 mt-0.5">
              {purchases.length} record
              {purchases.length !== 1 ? "s" : ""} total
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

        {/* Summary chips */}
        <View className="flex-row gap-3 mt-4 mb-4">
          <View className="flex-1 bg-green-50 rounded-xl px-3 py-2">
            <Text className="text-xs text-green-600/70">Total USD</Text>
            <Text className="text-base font-bold text-green-600 mt-0.5">
              ${formatNumber(totalUSD)}
            </Text>
          </View>
          <View className="flex-1 bg-orange-50 rounded-xl px-3 py-2">
            <Text className="text-xs text-orange-500/70">Total INR</Text>
            <Text className="text-base font-bold text-orange-500 mt-0.5">
              ₹{formatNumber(totalINR)}
            </Text>
          </View>
        </View>

        {/* Currency filter */}
        <View className="flex-row gap-2 mb-4">
          {(["ALL", "USD", "INR"] as const).map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCurrencyFilter(c)}
              className={`px-4 py-2 rounded-full border ${
                currencyFilter === c
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  currencyFilter === c ? "text-white" : "text-dark/50"
                }`}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-base text-dark"
            placeholder="Search supplier, package, code..."
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
              onRefresh={fetchPurchases}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => <PurchaseCard purchase={item} />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="cart-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                {search ? "No purchases found" : "No purchases yet"}
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                {search
                  ? "Try a different search"
                  : "Tap + to record your first purchase"}
              </Text>
            </View>
          }
        />
      )}

      <AddPurchaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

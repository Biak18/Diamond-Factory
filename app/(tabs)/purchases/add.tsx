import { DatePicker, DatePickerRef } from "@/src/components/DatePicker";
import { RowPicker, RowPickerRef } from "@/src/components/RowPicker";
import { TextBox, TextBoxRef } from "@/src/components/TextBox";
import { TextButton } from "@/src/components/TextButton";
import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { usePackageStore } from "@/src/stores/usePackageStore";
import { usePurchaseStore } from "@/src/stores/usePurchaseStore";
import { useSupplierStore } from "@/src/stores/useSupplierStore";
import { Ionicons } from "@expo/vector-icons";
import { Portal } from "@gorhom/portal";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });

// ─── Picker Modal ─────────────────────────────────────────────────
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

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setSearch("");
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  if (!visible) return null;

  const filtered = data.filter((d) =>
    String(d[labelKey]).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Portal hostName="bottomsheet">
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
          onPress={() => {
            setSearch("");
            onClose();
          }}
        />

        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 40,
            maxHeight: SCREEN_HEIGHT * 0.6,
          }}
        >
          <View
            style={{
              width: 48,
              height: 4,
              backgroundColor: "#E2E8F0",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_700Bold",
              color: "#0F172A",
              marginBottom: 16,
            }}
          >
            {title}
          </Text>

          <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12 mb-3">
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-2 text-base text-dark"
              placeholder="Search..."
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

          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.map((item) => {
              const isSelected = selected?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 12,
                    marginBottom: 4,
                    backgroundColor: isSelected
                      ? "rgba(37,99,235,0.1)"
                      : "transparent",
                  }}
                  onPress={() => {
                    onSelect(item);
                    setSearch("");
                    onClose();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_500Medium",
                        color: isSelected ? "#2563EB" : "#0F172A",
                      }}
                    >
                      {String(item[labelKey])}
                    </Text>
                    {subKey && item[subKey] && (
                      <Text
                        style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}
                      >
                        {String(item[subKey])}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563EB"
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {filtered.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 16, color: "#94A3B8" }}>
                  No results found
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Portal>
  );
}

// ─── Add Purchase Screen ──────────────────────────────────────────
export default function AddPurchaseScreen() {
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
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  // const [purchaseDate, setPurchaseDate] = useState(
  //   new Date().toISOString().split("T")[0],
  // );
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

  const purchaseDateRef = useRef<DatePickerRef>(null);

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
    fetchSuppliers();
    fetchPackages();
  }, []);

  const resetForm = () => {
    setSelectedSupplier(null);
    setSelectedPackage(null);
    setWeightCt("");
    setCurrency("USD");
    setPricePerCt("");
    setExchangeRate("");
    // setPurchaseDate(new Date().toISOString().split("T")[0]);
    setPurchaseDate(new Date());
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    router.back();
  };

  const handleSave = async () => {
    if (!selectedSupplier) {
      supplierRef.current?.setErrorMessage("Please select a suppiler");
      expectMessageRemover("supplier");
      return;
    }
    if (!selectedPackage) {
      packageRef.current?.setErrorMessage("Please select a package.");
      expectMessageRemover("pack");
      return;
    }
    if (!weightCt || isNaN(Number(weightCt)) || Number(weightCt) <= 0) {
      weightRef.current?.setErrorMessage("Please enter a valid weight in CT.");
      expectMessageRemover("weight");
      return;
    }
    if (!pricePerCt || isNaN(Number(pricePerCt)) || Number(pricePerCt) <= 0) {
      priceRef.current?.setErrorMessage("Please enter a valid price per CT.");
      expectMessageRemover("price");
      return;
    }
    if (!purchaseDate) {
      purchaseDateRef.current?.setErrorMessage("Please enter a purchase date.");
      expectMessageRemover("purdate");
      return;
    }
    if (!user?.id) {
      showMessage("User session not found.", "error");
      expectMessageRemover("all");
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
        purchase_date: purchaseDate.toISOString().split("T")[0],
        note: note.trim() || undefined,
        created_by: user.id,
      });
      handleClose();
    } catch (err: any) {
      showMessage(err?.message || "Could not save purchase.", "error");
    } finally {
      setSaving(false);
    }
  };

  const expectMessageRemover = (
    type: "purdate" | "supplier" | "pack" | "weight" | "price" | "all",
  ) => {
    switch (type) {
      case "all": {
        weightRef.current?.removeErrorMessage();
        priceRef.current?.removeErrorMessage();
        packageRef.current?.removeErrorMessage();
        supplierRef.current?.removeErrorMessage();
        purchaseDateRef.current?.removeErrorMessage();
        break;
      }
      case "pack": {
        weightRef.current?.removeErrorMessage();
        priceRef.current?.removeErrorMessage();
        supplierRef.current?.removeErrorMessage();
        purchaseDateRef.current?.removeErrorMessage();
        break;
      }
      case "price": {
        weightRef.current?.removeErrorMessage();
        packageRef.current?.removeErrorMessage();
        supplierRef.current?.removeErrorMessage();
        purchaseDateRef.current?.removeErrorMessage();
        break;
      }
      case "purdate": {
        weightRef.current?.removeErrorMessage();
        priceRef.current?.removeErrorMessage();
        packageRef.current?.removeErrorMessage();
        supplierRef.current?.removeErrorMessage();
        break;
      }
      case "supplier": {
        weightRef.current?.removeErrorMessage();
        priceRef.current?.removeErrorMessage();
        packageRef.current?.removeErrorMessage();
        purchaseDateRef.current?.removeErrorMessage();
        break;
      }
      case "weight": {
        priceRef.current?.removeErrorMessage();
        packageRef.current?.removeErrorMessage();
        supplierRef.current?.removeErrorMessage();
        purchaseDateRef.current?.removeErrorMessage();
        break;
      }
    }
  };

  return (
    <>
      <View className="flex-1 bg-surface">
        {/* Header */}
        <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-dark">New Purchase</Text>
              <Text className="text-sm text-dark/40">
                Fill in the purchase details
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={120}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableResetScrollToCoords={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: TAB_BAR_HEIGHT + 30,
          }}
        >
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

          <TextBox
            readonly={saving}
            ref={weightRef}
            title="Weight"
            icons="scale-outline"
            value={weightCt}
            onChange={setWeightCt}
            keyboardType="decimal-pad"
            nullable
            optionalText="(Ct)"
            optionalTextColor="black"
          />

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

          <View className="flex-row gap-3 mb-4">
            <TextBox
              readonly={saving}
              ref={priceRef}
              title="Price / Ct"
              value={pricePerCt}
              onChange={setPricePerCt}
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
              icons="swap-horizontal-outline"
            />
          </View>

          <View className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4">
            <Text className="text-xs text-primary/70 mb-1">
              Total Price (auto calculated)
            </Text>
            <Text className="text-2xl font-bold text-primary">
              {Number(exchangeRate) > 0
                ? "K "
                : currency === "USD"
                  ? "$ "
                  : "₹ "}
              {formatNumber(totalPrice)}
            </Text>
            {weightCt && pricePerCt && (
              <Text className="text-xs text-primary/50 mt-1">
                {Number(exchangeRate) > 0
                  ? `${currency === "USD" ? "$" : "₹"}${pricePerCt} × ${exchangeRate} (MMK rate)`
                  : `${currency === "USD" ? "$" : "₹"}${pricePerCt} / CT`}
              </Text>
            )}
          </View>

          <DatePicker
            readonly={saving}
            ref={purchaseDateRef}
            title="Purchase Date"
            nullable
            value={purchaseDate}
            OnDateChange={(date: any) => setPurchaseDate(date)}
            placeholder="DD-MM-YY"
          />

          <TextBox
            value={note}
            readonly={saving}
            multiline
            numberOfLines={2}
            style={{ minHeight: 75 }}
            onChange={setNote}
            title="Note"
            optionalText="(optional)"
          />

          <TextButton
            text="Save Purchase"
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          />
        </KeyboardAwareScrollView>
      </View>

      {/* ← Pickers OUTSIDE KeyboardAwareScrollView and outside main View */}
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

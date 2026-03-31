import { IconButton } from "@/src/components/IconButton";
import { SearchBar } from "@/src/components/SearchBar";
import { TextBox } from "@/src/components/TextBox";
import { DiamondSize, usePackageStore } from "@/src/stores/usePackageStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
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

// ─── Sieve Picker Modal ───────────────────────────────────────────
function SievePickerModal({
  visible,
  title,
  sizes,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  sizes: DiamondSize[];
  selected: DiamondSize | null;
  onSelect: (size: DiamondSize) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = sizes.filter((s) =>
    s.sieve_size.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Search sieve size..."
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

        <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
          {filtered.map((size) => {
            const isSelected = selected?.id === size.id;
            return (
              <TouchableOpacity
                key={size.id}
                className={`flex-row items-center py-3 px-2 rounded-xl mb-1 ${
                  isSelected ? "bg-primary/10" : ""
                }`}
                onPress={() => {
                  onSelect(size);
                  setSearch("");
                  onClose();
                }}
              >
                {/* Sieve size */}
                <View className="flex-1">
                  <Text
                    className={`text-base font-medium ${
                      isSelected ? "text-primary" : "text-dark"
                    }`}
                  >
                    {size.sieve_size}
                  </Text>
                  <Text className="text-xs text-dark/40 mt-0.5">
                    {size.p_cts && `P/Cts: ${size.p_cts}`}
                    {size.diameter_mm && ` · ⌀ ${size.diameter_mm}mm`}
                  </Text>
                </View>

                {/* Weight */}
                <Text className="text-sm text-dark/50 mr-3">
                  {size.weight_per_stone} ct
                </Text>

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

// ─── Sieve Picker Row ─────────────────────────────────────────────
function SievePickerRow({
  label,
  selected,
  onPress,
  onClear,
}: {
  label: string;
  selected: DiamondSize | null;
  onPress: () => void;
  onClear: () => void;
}) {
  return (
    <View className="flex-1">
      <TouchableOpacity
        className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-14"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="diamond-outline" size={18} color="#2563EB" />
        <Text
          className={`flex-1 ml-2 text-sm ${
            selected ? "text-dark font-medium" : "text-gray-400"
          }`}
          numberOfLines={1}
        >
          {selected ? selected.sieve_size : label}
        </Text>
        {selected ? (
          <Pressable onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        ) : (
          <Ionicons name="chevron-down-outline" size={16} color="#94A3B8" />
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Add Package Modal ────────────────────────────────────────────
function AddPackageModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { addPackage, sizes, fetchSizes } = usePackageStore();

  const [packageCode, setPackageCode] = useState("");
  const [packageName, setPackageName] = useState("");
  const [sieveFrom, setSieveFrom] = useState<DiamondSize | null>(null);
  const [sieveTo, setSieveTo] = useState<DiamondSize | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const noteRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) fetchSizes();
  }, [visible]);

  const handleSave = async () => {
    if (!packageCode.trim()) {
      Alert.alert("Missing Info", "Please enter a package code.");
      return;
    }
    if (!packageName.trim()) {
      Alert.alert("Missing Info", "Please enter a package name.");
      return;
    }

    setSaving(true);
    try {
      await addPackage({
        package_code: packageCode.trim().toUpperCase(),
        package_name: packageName.trim(),
        sieve_from: sieveFrom?.sieve_size,
        sieve_to: sieveTo?.sieve_size,
        note: note.trim() || undefined,
      });
      handleClose();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.message?.includes("unique")
          ? "Package code already exists."
          : err?.message || "Could not save package.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setPackageCode("");
    setPackageName("");
    setSieveFrom(null);
    setSieveTo(null);
    setNote("");
    onClose();
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
              <Text className="text-xl font-bold text-dark">Add Package</Text>
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
              {/* Sieve Range — optional */}
              <Text className="text-sm font-medium text-dark mb-2">
                Sieve Range{" "}
                <Text className="text-dark/30 font-normal">(optional)</Text>
              </Text>
              <View className="flex-row items-center gap-2 mb-4">
                <SievePickerRow
                  label="From"
                  selected={sieveFrom}
                  onPress={() => setShowFromPicker(true)}
                  onClear={() => setSieveFrom(null)}
                />
                <Ionicons
                  name="arrow-forward-outline"
                  size={16}
                  color="#94A3B8"
                />
                <SievePickerRow
                  label="To"
                  selected={sieveTo}
                  onPress={() => setShowToPicker(true)}
                  onClear={() => setSieveTo(null)}
                />
              </View>

              {/* Package Code */}
              <TextBox
                value={packageCode}
                onChange={setPackageCode}
                autoCapitalize="characters"
                placeholderColor="#9CA3AF"
                placeholder="e.g. 000-2"
                returnKeyType="next"
                title="Package Code"
                icons="layers-outline"
                nullable
                onSubmitEditing={() => nameRef.current?.focus()}
              />

              {/* Package Name */}
              <TextBox
                value={packageCode}
                onChange={setPackageCode}
                autoCapitalize="words"
                placeholderColor="#9CA3AF"
                placeholder="e.g. 000 to 2"
                returnKeyType="next"
                title="Package Name"
                icons="pricetag-outline"
                nullable
                onSubmitEditing={() => nameRef.current?.focus()}
              />

              {/* Note */}
              <TextBox
                multiline
                numberOfLines={2}
                style={{ minHeight: 70 }}
                value={note}
                optionalText="(optional)"
                onChange={setNote}
                title="Note"
                placeholderColor="#9CA3AF"
                placeholder="e.g. Small melee diamonds"
              />

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
                    Save Package
                  </Text>
                )}
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>

      {/* From Picker */}
      <SievePickerModal
        visible={showFromPicker}
        title="Select Sieve From"
        sizes={sizes}
        selected={sieveFrom}
        onSelect={setSieveFrom}
        onClose={() => setShowFromPicker(false)}
      />

      {/* To Picker */}
      <SievePickerModal
        visible={showToPicker}
        title="Select Sieve To"
        sizes={sizes}
        selected={sieveTo}
        onSelect={setSieveTo}
        onClose={() => setShowToPicker(false)}
      />
    </>
  );
}

// ─── Package Card ─────────────────────────────────────────────────
function PackageCard({
  pkg,
  onDelete,
}: {
  pkg: {
    id: string;
    package_code: string;
    package_name: string;
    sieve_from?: string;
    sieve_to?: string;
    note?: string;
  };
  onDelete: (id: string) => void;
}) {
  const handleDelete = () => {
    Alert.alert(
      "Delete Package",
      `Are you sure you want to delete "${pkg.package_code}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(pkg.id),
        },
      ],
    );
  };

  const hasSieveRange = pkg.sieve_from || pkg.sieve_to;

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm">
      <View className="flex-row items-center">
        {/* Icon */}
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-4">
          <Ionicons name="layers-outline" size={24} color="#2563EB" />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-bold text-dark">
            {pkg.package_code}
          </Text>
          <Text className="text-sm text-dark/50 mt-0.5">
            {pkg.package_name}
          </Text>
        </View>

        {/* Delete */}
        <Pressable
          onPress={handleDelete}
          className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>

      {/* Sieve range — only show if exists */}
      {hasSieveRange && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          {pkg.sieve_from && (
            <View className="flex-1 bg-surface rounded-xl px-3 py-2 items-center">
              <Text className="text-xs text-dark/40">From</Text>
              <Text className="text-sm font-bold text-dark mt-0.5">
                {pkg.sieve_from}
              </Text>
            </View>
          )}
          {pkg.sieve_from && pkg.sieve_to && (
            <View className="px-3">
              <Ionicons
                name="arrow-forward-outline"
                size={16}
                color="#94A3B8"
              />
            </View>
          )}
          {pkg.sieve_to && (
            <View className="flex-1 bg-surface rounded-xl px-3 py-2 items-center">
              <Text className="text-xs text-dark/40">To</Text>
              <Text className="text-sm font-bold text-dark mt-0.5">
                {pkg.sieve_to}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Note */}
      {pkg.note && (
        <View className="mt-2 pt-2 border-t border-gray-100">
          <Text className="text-xs text-dark/40">📝 {pkg.note}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Packages Screen ──────────────────────────────────────────────
export default function PackagesScreen() {
  const { packages, isLoading, fetchPackages, deletePackage } =
    usePackageStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const filtered = packages.filter(
    (p) =>
      p.package_code.toLowerCase().includes(search.toLowerCase()) ||
      p.package_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePackage(id);
    } catch (err: any) {
      Alert.alert("Cannot Delete", err?.message || "Could not delete package.");
    }
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-dark">Packages</Text>
            <Text className="text-sm text-dark/50 mt-0.5">
              {packages.length} package
              {packages.length !== 1 ? "s" : ""} total
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
          onChange={setSearch}
          value={search}
          placeholder="Search packages..."
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
              onRefresh={fetchPackages}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => (
            <PackageCard pkg={item} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="layers-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                {search ? "No packages found" : "No packages yet"}
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                {search
                  ? "Try a different search"
                  : "Tap + to add your first package"}
              </Text>
            </View>
          }
        />
      )}

      <AddPackageModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

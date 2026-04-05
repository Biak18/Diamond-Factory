import BottomSheet from "@/src/components/BottomSheet";
import { CheckBox } from "@/src/components/CheckBox";
import { IconButton } from "@/src/components/IconButton";
import { RowPickerRef } from "@/src/components/RowPicker";
import { SearchBar } from "@/src/components/SearchBar";
import { TextBox, TextBoxRef } from "@/src/components/TextBox";
import { TextButton } from "@/src/components/TextButton";
import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { DiamondSize, usePackageStore } from "@/src/stores/usePackageStore";
import { Ionicons } from "@expo/vector-icons";
import { Portal } from "@gorhom/portal";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

  const filtered = sizes.filter((s) =>
    s.sieve_size.toLowerCase().includes(search.toLowerCase()),
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
        {/* Backdrop */}
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

        {/* Sheet */}
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
          {/* Handle bar */}
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

          {/* Title */}
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

          {/* Search */}
          <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12 mb-3">
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-2 text-base text-dark"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginBottom: 8 }}
          >
            {filtered.map((size) => {
              const isSelected = selected?.id === size.id;
              return (
                <TouchableOpacity
                  key={size.id}
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
                    onSelect(size);
                    setSearch("");
                    onClose();
                  }}
                >
                  {/* Sieve info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_500Medium",
                        color: isSelected ? "#2563EB" : "#0F172A",
                      }}
                    >
                      {size.sieve_size}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#94A3B8",
                        marginTop: 2,
                      }}
                    >
                      {size.p_cts && `P/Cts: ${size.p_cts}`}
                      {size.diameter_mm && ` · ⌀ ${size.diameter_mm}mm`}
                    </Text>
                  </View>

                  {/* Weight */}
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#94A3B8",
                      marginRight: 8,
                    }}
                  >
                    {size.weight_per_stone} ct
                  </Text>

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
  const [sieveFrom, setSieveFrom] = useState("");
  const [sieveTo, setSieveTo] = useState("");
  // const [sieveFrom, setSieveFrom] = useState<DiamondSize | null>(null);
  // const [sieveTo, setSieveTo] = useState<DiamondSize | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [giaCheck, setGiaCheck] = useState(false);

  // const [showFromPicker, setShowFromPicker] = useState(false);
  // const [showToPicker, setShowToPicker] = useState(false);

  const pkgNameRef = useRef<TextBoxRef>(null);
  const pkgCodeRef = useRef<TextBoxRef>(null);
  const noteRef = useRef<TextBoxRef>(null);
  const fromRef = useRef<RowPickerRef>(null);
  const toRef = useRef<RowPickerRef>(null);

  useEffect(() => {
    if (visible) fetchSizes();
  }, [visible]);

  const handleSave = async () => {
    if (!packageCode.trim()) {
      pkgCodeRef.current?.setErrorMessage("Please enter a package code.");
      pkgNameRef.current?.removeErrorMessage();
      return;
    }
    if (!packageName.trim()) {
      pkgNameRef.current?.setErrorMessage("Please enter a package name.");
      pkgCodeRef.current?.removeErrorMessage();
      return;
    }

    setSaving(true);
    try {
      await addPackage({
        package_code: packageCode.trim().toUpperCase(),
        package_name: packageName.trim(),
        sieve_from: sieveFrom,
        sieve_to: sieveTo,
        // sieve_from: sieveFrom?.sieve_size,
        // sieve_to: sieveTo?.sieve_size,
        note: note.trim() || undefined,
      });
      handleClose();
    } catch (err: any) {
      showMessage(
        err?.message?.includes("unique")
          ? "Package code already exists."
          : err?.message || "Could not save package.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setPackageCode("");
    setPackageName("");
    setSieveFrom("");
    setSieveTo("");
    // setSieveFrom(null);
    // setSieveTo(null);
    setNote("");
    onClose();
  };

  useEffect(() => {}, []);

  return (
    <>
      <BottomSheet visible={visible} title="Add Package" onClose={handleClose}>
        <View className="flex-row items-center gap-2">
          <TextBox
            title="Sieve Range"
            optionalText="(From)"
            value={sieveFrom}
            icons="diamond-outline"
            onChange={setSieveFrom}
            keyboardType="number-pad"
          />
          {/* <RowPicker
            ref={fromRef}
            value={sieveFrom?.sieve_size}
            onPress={() => setShowFromPicker(true)}
            onClear={() => setSieveFrom(null)}
            title="Sieve Range"
            optionalText="(optional)"
            icon="diamond-outline"
            toArrow
          /> */}
          <TextBox
            title="Sieve Range"
            optionalText="(To)"
            value={sieveTo}
            onChange={setSieveTo}
            icons="diamond-outline"
            keyboardType="number-pad"
          />
          {/* <RowPicker
            ref={toRef}
            value={sieveTo?.sieve_size}
            onPress={() => setShowToPicker(true)}
            onClear={() => setSieveTo(null)}
            icon="diamond-outline"
          /> */}
        </View>
        <CheckBox
          onCheck={(e) => setGiaCheck(e)}
          value={giaCheck}
          text="GIA certified"
          optionalText="(Test)"
        />

        <TextBox
          ref={pkgCodeRef}
          value={sieveFrom || sieveTo ? sieveFrom + " : " + sieveTo : ""}
          autoCapitalize="characters"
          returnKeyType="next"
          title="Package Code"
          icons="layers-outline"
          nullable
          onSubmitEditing={() => pkgNameRef.current?.focus()}
        />

        <TextBox
          ref={pkgNameRef}
          value={packageName}
          onChange={setPackageName}
          autoCapitalize="words"
          returnKeyType="next"
          title="Package Name"
          icons="pricetag-outline"
          nullable
          onSubmitEditing={() => noteRef.current?.focus()}
        />

        <TextBox
          ref={noteRef}
          multiline
          numberOfLines={2}
          style={{ minHeight: 70 }}
          value={note}
          optionalText="(optional)"
          onChange={setNote}
          title="Note"
        />

        <TextButton
          text="Save Package"
          loading={saving}
          disabled={saving}
          onClick={handleSave}
        />
      </BottomSheet>

      {/* Sieve pickers — also need Portal so they appear above BottomSheet */}
      {/* <SievePickerModal
        visible={showFromPicker}
        title="Select Sieve From"
        sizes={sizes}
        selected={sieveFrom}
        onSelect={setSieveFrom}
        onClose={() => setShowFromPicker(false)}
      />

      <SievePickerModal
        visible={showToPicker}
        title="Select Sieve To"
        sizes={sizes}
        selected={sieveTo}
        onSelect={setSieveTo}
        onClose={() => setShowToPicker(false)}
      /> */}
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
    showConfirm(`Are you sure you want to delete "${pkg.package_code}"?`, () =>
      onDelete(pkg.id),
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
      showMessage(err?.message || "Could not delete package.", "error");
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
          contentContainerStyle={{
            padding: 16,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
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

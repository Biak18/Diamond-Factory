import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { PackageStock, useStockStore } from "@/src/stores/useStockStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Package Card ─────────────────────────────────────────────────
function PackageCard({ item }: { item: PackageStock }) {
  return (
    <Pressable
      className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm"
      onPress={() => router.push(`/stock/${item.package_id}`)}
    >
      {/* Top row — name + stock badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-dark">
            {item.package_name}
          </Text>
          <Text className="text-sm text-dark/40 mt-0.5">
            {item.package_code}
          </Text>
        </View>

        {/* Current stock */}
        <View className="bg-primary/10 px-4 py-2 rounded-xl items-center">
          <Text className="text-xs text-primary/70">Stock</Text>
          <Text className="text-xl font-bold text-primary">
            {Number(item.current_stock_ct).toFixed(2)}
          </Text>
          <Text className="text-xs text-primary/60">CT</Text>
        </View>
      </View>

      {/* IN / OUT row */}
      <View className="flex-row border-t border-gray-100 pt-3 gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-green-100 items-center justify-center">
            <Ionicons name="arrow-down-outline" size={14} color="#16a34a" />
          </View>
          <View>
            <Text className="text-xs text-dark/40">Total IN</Text>
            <Text className="text-base font-bold text-green-600">
              +{Number(item.total_in_ct).toFixed(2)} CT
            </Text>
          </View>
        </View>

        <View className="w-px bg-gray-100" />

        <View className="flex-1 flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-red-100 items-center justify-center">
            <Ionicons name="arrow-up-outline" size={14} color="#ef4444" />
          </View>
          <View>
            <Text className="text-xs text-dark/40">Total OUT</Text>
            <Text className="text-base font-bold text-red-400">
              -{Number(item.total_out_ct).toFixed(2)} CT
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <View className="items-center justify-center ml-1">
          <Ionicons name="chevron-forward-outline" size={18} color="#94A3B8" />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────
export default function HomeScreen() {
  const {
    packageStock,
    isLoading,
    fetchPackageStock,
    subscribeToTransactions,
  } = useStockStore();
  const { profile } = useAuthStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPackageStock();
    const unsubscribe = subscribeToTransactions();
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return packageStock;
    return packageStock.filter(
      (pkg) =>
        pkg.package_name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.package_code.toLowerCase().includes(search.toLowerCase()),
    );
  }, [packageStock, search]);

  const totalStock = packageStock.reduce(
    (sum, pkg) => sum + Number(pkg.current_stock_ct),
    0,
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        {/* Greeting row */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-dark/40">{greeting()},</Text>
            <Text className="text-2xl font-bold text-dark">
              {profile?.name ?? "there"} 👋
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Live badge */}
            <View className="flex-row items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-xs font-medium text-green-600">Live</Text>
            </View>

            {/* Refresh */}
            <TouchableOpacity
              onPress={fetchPackageStock}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <Ionicons name="refresh-outline" size={22} color="#2563EB" />
            </TouchableOpacity>

            {/* Avatar */}
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-primary items-center justify-center"
              onPress={() => router.push("/profile")}
            >
              <Text className="text-base font-bold text-white">
                {profile?.name ? getInitials(profile.name) : "?"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total stock chip */}
        <View className="bg-primary/10 rounded-2xl px-4 py-3 mb-4">
          <Text className="text-sm text-primary/70">Total Stock</Text>
          <Text className="text-3xl font-bold text-primary mt-0.5">
            {totalStock.toFixed(2)}{" "}
            <Text className="text-lg font-medium">CT</Text>
          </Text>
          <Text className="text-xs text-primary/50 mt-1">
            Across {packageStock.length} package
            {packageStock.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-base text-dark"
            placeholder="Search packages..."
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
          keyExtractor={(item) => item.package_id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchPackageStock}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => <PackageCard item={item} />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="layers-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                No stock data yet
              </Text>
              <Text className="text-sm text-dark/30 mt-1 text-center">
                Add packages and purchases{"\n"}to see stock here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

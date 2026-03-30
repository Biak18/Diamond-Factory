import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useStockStore } from "@/src/stores/useStockStore";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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

//  Stock Row
function PackageCard({
  item,
}: {
  item: {
    package_id: string;
    package_name: string;
    package_code: string;
    current_stock_ct: number;
    total_in_ct: number;
    total_out_ct: number;
  };
}) {
  const isLow = item.current_stock_ct <= 5;
  const isEmpty = item.current_stock_ct <= 0;

  return (
    <Link asChild href={`/stock/${item.package_id}`}>
      <Pressable className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-3 shadow-sm">
        {/* Item info */}
        <View className="flex-1">
          <Text className="text-sm font-medium text-dark">
            {item.package_name}
          </Text>
          <Text className="text-xs text-dark/40 mt-0.5">
            {item.package_code}
          </Text>
        </View>

        {/* IN / OUT small */}
        <View className="flex-row gap-3 mr-4">
          <View className="items-center">
            <Text className="text-xs text-dark/30">IN</Text>
            <Text className="text-xs font-medium text-green-600">
              +{item.total_in_ct}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-dark/30">OUT</Text>
            <Text className="text-xs font-medium text-red-400">
              -{item.total_out_ct}
            </Text>
          </View>
        </View>

        {/* Stock badge */}
        <View
          className={`min-w-[48px] items-center px-3 py-1 rounded-full ${
            isEmpty ? "bg-red-100" : isLow ? "bg-yellow-100" : "bg-green-100"
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              isEmpty
                ? "text-red-500"
                : isLow
                  ? "text-yellow-600"
                  : "text-green-600"
            }`}
          >
            {item.current_stock_ct}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

//  Home Screen
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
    return () => {
      unsubscribe();
    };
  }, []);

  // Filter by warehouse name or item name
  const filtered = useMemo(() => {
    if (!search) return packageStock;

    return packageStock.filter(
      (pkg) =>
        pkg.package_name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.package_code.toLowerCase().includes(search.toLowerCase()),
    );
  }, [packageStock, search]);

  // Overall totals
  const totalStock = packageStock.reduce(
    (sum, pkg) => sum + pkg.current_stock_ct,
    0,
  );
  const totalLow = packageStock.reduce(
    (sum, pkg) => sum + (pkg.current_stock_ct <= 5 ? 1 : 0),
    0,
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 border-b border-gray-100">
        {/* Greeting */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-dark/40">{greeting()},</Text>
            <Text className="text-2xl font-bold text-dark">
              {profile?.name ?? "there"} 👋
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-xs font-medium text-green-600">Live</Text>
            </View>
            <TouchableOpacity
              onPress={fetchPackageStock}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <Ionicons name="refresh-outline" size={22} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full  bg-primary items-center justify-center"
              onPress={() => {
                router.push("/profile");
              }}
            >
              <Text className="text-xl font-bold text-white">
                {profile?.name ? getInitials(profile.name) : "?"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary chips */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-primary/10 rounded-xl px-3 py-2">
            <Text className="text-xs text-primary/70">Total Stock</Text>
            <Text className="text-xl font-bold text-primary mt-0.5">
              {totalStock}
            </Text>
          </View>
          <View className="flex-1 bg-yellow-50 rounded-xl px-3 py-2">
            <Text className="text-xs text-yellow-600/70">Low / Empty</Text>
            <Text className="text-xl font-bold text-yellow-600 mt-0.5">
              {totalLow}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-surface border border-gray-200 rounded-xl px-4 h-12">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-2 text-base text-dark"
            placeholder="Search warehouse or item..."
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
              <Ionicons name="stats-chart-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                No stock data yet
              </Text>
              <Text className="text-sm text-dark/30 mt-1 text-center">
                Add items, warehouses and{"\n"}transactions to see stock here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useStockStore, WarehouseStock } from "@/src/stores/useStockStore";
import { Ionicons } from "@expo/vector-icons";
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
function StockRow({
  item,
}: {
  item: {
    item_name: string;
    item_code: string;
    current_stock: number;
    total_in: number;
    total_out: number;
  };
}) {
  const isLow = item.current_stock <= 5;
  const isEmpty = item.current_stock <= 0;

  return (
    <View className="flex-row items-center py-3 border-b border-gray-50">
      {/* Item info */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-dark">{item.item_name}</Text>
        <Text className="text-xs text-dark/40 mt-0.5">{item.item_code}</Text>
      </View>

      {/* IN / OUT small */}
      <View className="flex-row gap-3 mr-4">
        <View className="items-center">
          <Text className="text-xs text-dark/30">IN</Text>
          <Text className="text-xs font-medium text-green-600">
            +{item.total_in}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-dark/30">OUT</Text>
          <Text className="text-xs font-medium text-red-400">
            -{item.total_out}
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
          {item.current_stock}
        </Text>
      </View>
    </View>
  );
}

//  Warehouse Card
function WarehouseCard({ warehouse }: { warehouse: WarehouseStock }) {
  const [expanded, setExpanded] = useState(true);

  const lowCount = warehouse.items.filter(
    (i) => i.current_stock <= 5 && i.current_stock > 0,
  ).length;
  const emptyCount = warehouse.items.filter((i) => i.current_stock <= 0).length;

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
      {/* Warehouse Header */}
      <TouchableOpacity
        className="px-4 py-4 flex-row items-center"
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <Ionicons name="business-outline" size={24} color="#2563EB" />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-bold text-dark">
            {warehouse.wh_name}
          </Text>
          <Text className="text-sm text-dark/40 mt-0.5">
            {warehouse.wh_code} · {warehouse.totalItems} item
            {warehouse.totalItems !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Alerts */}
        <View className="flex-row gap-2 mr-2">
          {emptyCount > 0 && (
            <View className="bg-red-100 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-red-500">
                {emptyCount} empty
              </Text>
            </View>
          )}
          {lowCount > 0 && (
            <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-yellow-600">
                {lowCount} low
              </Text>
            </View>
          )}
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {/* Stats row */}
      {expanded && (
        <>
          <View className="flex-row border-t border-b border-gray-100 mx-4">
            <View className="flex-1 items-center py-2">
              <Text className="text-xs text-dark/40">Total Stock</Text>
              <Text className="text-base font-bold text-dark mt-0.5">
                {warehouse.totalStock}
              </Text>
            </View>
            <View className="w-px bg-gray-100" />
            <View className="flex-1 items-center py-2">
              <Text className="text-xs text-dark/40">Items OK</Text>
              <Text className="text-base font-bold text-green-600 mt-0.5">
                {warehouse.items.filter((i) => i.current_stock > 5).length}
              </Text>
            </View>
            <View className="w-px bg-gray-100" />
            <View className="flex-1 items-center py-2">
              <Text className="text-xs text-dark/40">Low / Empty</Text>
              <Text className="text-base font-bold text-red-400 mt-0.5">
                {lowCount + emptyCount}
              </Text>
            </View>
          </View>

          {/* Item rows */}
          <View className="px-4 pb-2">
            {warehouse.items.map((item) => (
              <StockRow key={item.item_id} item={item} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

//  Home Screen
export default function HomeScreen() {
  const { summary, isLoading, fetchSummary, subscribeToTransactions } =
    useStockStore();
  const { profile } = useAuthStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSummary();

    const unsubscribe = subscribeToTransactions();
    return () => {
      unsubscribe();
    };
  }, []);

  // Group summary rows by warehouse
  const warehouseStocks: WarehouseStock[] = useMemo(() => {
    const map = new Map<string, WarehouseStock>();

    summary.forEach((row) => {
      if (!map.has(row.warehouse_id)) {
        map.set(row.warehouse_id, {
          warehouse_id: row.warehouse_id,
          wh_code: row.wh_code,
          wh_name: row.wh_name,
          items: [],
          totalItems: 0,
          totalStock: 0,
        });
      }
      const wh = map.get(row.warehouse_id)!;
      wh.items.push(row);
      wh.totalItems += 1;
      wh.totalStock += row.current_stock;
    });

    return Array.from(map.values());
  }, [summary]);

  // Filter by warehouse name or item name
  const filtered = useMemo(() => {
    if (!search) return warehouseStocks;
    return warehouseStocks
      .map((wh) => ({
        ...wh,
        items: wh.items.filter(
          (i) =>
            i.item_name.toLowerCase().includes(search.toLowerCase()) ||
            i.item_code.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter(
        (wh) =>
          wh.wh_name.toLowerCase().includes(search.toLowerCase()) ||
          wh.items.length > 0,
      );
  }, [warehouseStocks, search]);

  // Overall totals
  const totalStock = warehouseStocks.reduce(
    (sum, wh) => sum + wh.totalStock,
    0,
  );
  const totalLow = warehouseStocks.reduce(
    (sum, wh) => sum + wh.items.filter((i) => i.current_stock <= 5).length,
    0,
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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
              onPress={fetchSummary}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
            >
              <Ionicons name="refresh-outline" size={22} color="#2563EB" />
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
          <View className="flex-1 bg-green-50 rounded-xl px-3 py-2">
            <Text className="text-xs text-green-600/70">Warehouses</Text>
            <Text className="text-xl font-bold text-green-600 mt-0.5">
              {warehouseStocks.length}
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
          keyExtractor={(wh) => wh.warehouse_id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchSummary}
              tintColor="#2563EB"
            />
          }
          renderItem={({ item }) => <WarehouseCard warehouse={item} />}
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

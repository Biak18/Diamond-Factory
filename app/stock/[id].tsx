import { StockDetail, useStockDetailStore } from "@/src/stores/useStockDetail";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────
const formatNumber = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Purchase Card ────────────────────────────────────────────────
function PurchaseCard({ item }: { item: StockDetail }) {
  const hasExchangeRate = item.exchange_rate && item.exchange_rate > 0;

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm">
      {/* Top row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-xs font-bold text-primary">
            {item.purchase_code}
          </Text>
        </View>
        <View className="flex-row gap-1 items-center">
          <Ionicons
            name="calendar-outline"
            size={10}
            color="rgb(15 23 42 / 0.4)"
          />
          <Text className="text-xs text-dark font-bold">
            {item.purchase_date} (
            {new Date(item.purchase_date).toLocaleDateString("en-US", {
              month: "short",
            })}
            )
          </Text>
        </View>
      </View>

      {/* Supplier */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
          <Text className="text-sm font-bold text-primary">
            {item.supplier_name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <View>
          <Text className="text-base font-bold text-dark">
            {item.supplier_name ?? "No supplier"}
          </Text>
          <Text className="text-xs text-dark/40">by {item.name}</Text>
        </View>
      </View>

      {/* Weight + Price + Total */}
      <View className="flex-row border-t border-gray-100 pt-3 gap-2">
        <View className="flex-1 items-center bg-surface rounded-xl py-2">
          <Text className="text-xs text-dark/40">Weight</Text>
          <Text className="text-base font-bold text-dark mt-0.5">
            {Number(item.weight_ct).toFixed(3)}
          </Text>
          <Text className="text-xs text-dark/40">CT</Text>
        </View>

        <View className="flex-1 items-center bg-surface rounded-xl py-2">
          <Text className="text-xs text-dark/40">Price / CT</Text>
          <Text className="text-base font-bold text-dark mt-0.5">
            {formatNumber(Number(item.price_per_ct))}
          </Text>
          <Text className="text-xs text-dark/40">{item.currency}</Text>
        </View>

        <View className="flex-1 items-center bg-green-50 rounded-xl py-2">
          <Text className="text-xs text-green-600/70">Total</Text>
          <Text className="text-base font-bold text-green-600 mt-0.5">
            {formatNumber(Number(item.total_price))}
          </Text>
          <Text className="text-xs text-green-600/60">
            {hasExchangeRate ? "MMK" : item.currency}
          </Text>
        </View>
      </View>

      {/* Exchange rate */}
      {hasExchangeRate && (
        <View className="mt-2 pt-2 border-t border-gray-100 flex-row items-center gap-1">
          <Ionicons name="swap-horizontal-outline" size={13} color="#94A3B8" />
          <Text className="text-xs text-dark/40">
            Rate: {item.exchange_rate} · {item.currency}{" "}
            {formatNumber(Number(item.price_per_ct))} × {item.exchange_rate} =
            MMK
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Stock Detail Screen ──────────────────────────────────────────
export default function StockDetailScreen() {
  const { id } = useLocalSearchParams();
  const { stockDetails, isLoading, fetchStockDetails } = useStockDetailStore();

  useEffect(() => {
    if (!id) return;
    fetchStockDetails(id as string);
  }, [id]);

  const totalIn = useMemo(
    () => stockDetails.reduce((sum, i) => sum + Number(i.in_ct), 0),
    [stockDetails],
  );

  const totalOut = useMemo(
    () => stockDetails.reduce((sum, i) => sum + Number(i.out_ct), 0),
    [stockDetails],
  );

  const currentStock = totalIn - totalOut;
  const pkg = stockDetails[0];

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-3 border-b border-gray-100">
        {/* Back + title */}
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center"
          >
            <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xs text-dark/40">{pkg?.package_code}</Text>
            <Text className="text-2xl font-bold text-dark">
              {pkg?.package_name ?? "Package Detail"}
            </Text>
          </View>
        </View>

        {/* Summary row */}
        <View className="flex-row gap-2">
          {/* LEFT (Stock) */}
          <View className="flex-1 bg-primary/10 rounded-2xl p-4 justify-center">
            <Text className="text-xs text-primary/70">Current Stock</Text>
            <Text className="text-2xl font-bold text-primary mt-1">
              {currentStock.toFixed(2)} CT
            </Text>
          </View>

          {/* RIGHT SIDE */}
          <View className="flex-1 gap-1">
            {/* IN */}
            <View className="bg-green-50 rounded-2xl p-4 py-1">
              <Text className="text-xs text-green-600/70">Total IN</Text>
              <Text className="text-xl font-bold text-green-600 mt-1">
                +{totalIn.toFixed(2)} CT
              </Text>
            </View>

            {/* OUT */}
            <View className="bg-red-50 rounded-2xl p-4 py-">
              <Text className="text-xs text-red-400/70">Total OUT</Text>
              <Text className="text-xl font-bold text-red-400 mt-1">
                -{totalOut.toFixed(2)} CT
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section title */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-base font-bold text-dark">Purchase History</Text>
        <Text className="text-sm text-dark/40">
          {stockDetails.length} record
          {stockDetails.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={stockDetails}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => <PurchaseCard item={item} />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="receipt-outline" size={56} color="#CBD5E1" />
              <Text className="text-lg font-bold text-dark/40 mt-4">
                No purchases yet
              </Text>
              <Text className="text-sm text-dark/30 mt-1">
                Add a purchase to see history here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

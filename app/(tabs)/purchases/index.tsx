import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { Purchase, usePurchaseStore } from "@/src/stores/usePurchaseStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const formatNumber = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });

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
        <View className="flex-row gap-1 items-center">
          <Ionicons name="calendar-outline" size={10} color="#2563EB" />
          <Text className="text-xs text-dark font-bold">
            {purchase.purchase_date} (
            {new Date(purchase.purchase_date).toLocaleDateString("en-US", {
              month: "short",
            })}
            )
          </Text>
        </View>
        {/* <Text className="text-xs text-dark font-bold">

          {formatDate(purchase.purchase_date)}
        </Text> */}
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
            onPress={() => router.push("/(tabs)/purchases/add")}
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
    </View>
  );
}

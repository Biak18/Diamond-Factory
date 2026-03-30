import { StockDetail, useStockDetailStore } from "@/src/stores/useStockDetail";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import React, { useEffect, useMemo } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

const StockDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { isLoading, fetchStockDetails, stockDetails } = useStockDetailStore();

  useEffect(() => {
    if (!id) return;
    fetchStockDetails(id as string);
  }, [id]);

  // 🔹 Summary
  const totalIn = useMemo(
    () => stockDetails.reduce((sum, i) => sum + i.in_ct, 0),
    [stockDetails],
  );

  const totalOut = useMemo(
    () => stockDetails.reduce((sum, i) => sum + i.out_ct, 0),
    [stockDetails],
  );

  const currentStock = totalIn - totalOut;

  const pkg = stockDetails[0]; // same package for all rows

  const PurchaseCard = ({ item }: { item: StockDetail }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      {/* Top */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-bold text-dark bg-yellow-200 p-2 rounded-xl py-1">
          {item.purchase_code}
        </Text>
        <View className="flex-row gap-1 items-center">
          <Ionicons
            name="calendar-outline"
            size={10}
            color="rgb(15 23 42 / 0.4)"
          />
          <Text className="text-xs text-dark/40">
            {item.purchase_date} (
            {new Date(item.purchase_date).toLocaleDateString("en-US", {
              month: "short",
            })}
            )
          </Text>
        </View>
      </View>

      {/* Supplier */}
      <Text className="text-2xl font-bold text-black mt-1">
        {item.supplier_name ?? "No supplier"}
      </Text>
      <Text className="text-sm text-dark/40">by {item.name}</Text>

      <View className="h-px bg-gray-100 my-3" />

      {/* Details */}
      <View className="flex-row w-full justify-between gap-1">
        <View className="flex-1 p-3 bg-dark/5 rounded-2xl">
          <Text className="text-xs text-dark/40 text-center">Weight</Text>
          <Text className="text-base font-bold text-dark text-center">
            {item.weight_ct.toFixed(2)}
          </Text>
          <Text className="text-xs text-dark/40 text-center">CT</Text>
        </View>

        <View className="flex-1 p-3 bg-dark/5 rounded-2xl">
          <Text className="text-xs text-dark/40 text-center">Price/CT</Text>
          <Text className="text-base font-bold text-dark text-center">
            {item.price_per_ct}
          </Text>
          <Text className="text-xs text-dark/40 text-center">
            {item.currency}
          </Text>
        </View>

        <View className="flex-1 p-3 bg-dark/5 rounded-2xl">
          <Text className="text-xs text-dark/40 text-center">Total</Text>
          <Text className="text-base font-bold text-center text-green-600">
            {item.total_price.toLocaleString()}
          </Text>
          <Text className="text-xs text-dark/40 text-center">
            {item.currency}
          </Text>
        </View>
      </View>
      <View className="h-px bg-gray-100 my-3" />
      {/*Exchange Rate*/}
      <View className="flex-row items-center gap-2">
        <Ionicons
          name="swap-horizontal-outline"
          color="rgb(15 23 42 / 0.4)"
          size={12}
        />
        <View>
          <Text className="text-dark/40 text-xs">
            Price/CT: {item.price_per_ct}
            {"    "} Rate: {item.exchange_rate}
          </Text>
          <Text className="text-dark/60 text-sm font-semibold">
            Total:{" "}
            {(item.price_per_ct * Number(item.exchange_rate)).toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )}{" "}
            MMK
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-surface">
      {/* 🔹 HEADER */}
      <View className="flex-row items-center w-full gap-5 px-6 pt-14 pb-4 bg-white border-b border-gray-100">
        <Pressable onPress={() => navigate("/")}>
          <Image
            source={require("../../assets/images/back.png")}
            style={{
              width: 25,
              height: 25,
            }}
          />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Ionicons name="diamond" size={28} />
          <View>
            <Text className="text-xs text-dark/40">{pkg?.package_code}</Text>
            <Text className="text-2xl font-bold text-dark">
              {pkg?.package_name}
            </Text>
            {/* <Text className="text-sm text-dark/40 mt-1">
          {pkg?.sieve_from} - {pkg?.sieve_to} mm
        </Text> */}
          </View>
        </View>
      </View>

      {/* 🔹 SUMMARY */}
      <View className="flex-row gap-3 p-3">
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
          <View className="bg-green-50 rounded-2xl p-4 py-2">
            <Text className="text-xs text-green-600/70">Total IN</Text>
            <Text className="text-xl font-bold text-green-600 mt-1">
              +{totalIn.toFixed(2)} CT
            </Text>
          </View>

          {/* OUT */}
          <View className="bg-red-50 rounded-2xl p-4 py-2">
            <Text className="text-xs text-red-400/70">Total OUT</Text>
            <Text className="text-xl font-bold text-red-400 mt-1">
              -{totalOut.toFixed(2)} CT
            </Text>
          </View>
        </View>
      </View>

      {/* 🔹 LIST TITLE */}
      <View className="px-6 pb-2">
        <Text className="text-lg font-semibold text-dark/70">
          Purchased History
        </Text>
        <Text className="text-dark/40">{stockDetails.length} records</Text>
      </View>

      {/* 🔹 LIST */}
      <FlatList
        data={stockDetails}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PurchaseCard item={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-dark/40">No data</Text>
          </View>
        }
      />
    </View>
  );
};

export default StockDetailScreen;

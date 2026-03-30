import { StockDetail, useStockDetailStore } from "@/src/stores/useStockDetail";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { FlatList, Text, View } from "react-native";

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
        <Text className="text-sm font-bold text-dark">
          {item.purchase_code}
        </Text>
        <Text className="text-xs text-dark/40">{item.purchase_date}</Text>
      </View>

      {/* Supplier */}
      <Text className="text-sm text-dark/60 mt-1">
        {item.supplier_name ?? "No supplier"}
      </Text>

      <View className="h-px bg-gray-100 my-3" />

      {/* Details */}
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-dark/40">Weight</Text>
          <Text className="text-base font-bold text-dark">
            {item.weight_ct.toFixed(2)} CT
          </Text>
        </View>

        <View>
          <Text className="text-xs text-dark/40">Price/CT</Text>
          <Text className="text-base font-medium text-dark">
            {item.currency} {item.price_per_ct}
          </Text>
        </View>

        <View>
          <Text className="text-xs text-dark/40">Total</Text>
          <Text className="text-base font-bold text-green-600">
            {item.currency} {item.total_price}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-surface">
      {/* 🔹 HEADER */}
      <View className="px-6 pt-14 pb-4 bg-white border-b border-gray-100">
        <Text className="text-xs text-dark/40">{pkg?.package_code}</Text>

        <Text className="text-2xl font-bold text-dark">
          {pkg?.package_name}
        </Text>

        {/* <Text className="text-sm text-dark/40 mt-1">
          {pkg?.sieve_from} - {pkg?.sieve_to} mm
        </Text> */}
      </View>

      {/* 🔹 SUMMARY */}
      <View className="flex-row gap-3 px-4 py-4 bg-white">
        {/* Stock */}
        <View className="flex-1 bg-primary/10 rounded-2xl p-4">
          <Text className="text-xs text-primary/70">Stock</Text>
          <Text className="text-xl font-bold text-primary mt-1">
            {currentStock.toFixed(2)} CT
          </Text>
        </View>

        {/* IN */}
        <View className="flex-1 bg-green-50 rounded-2xl p-4">
          <Text className="text-xs text-green-600/70">IN</Text>
          <Text className="text-xl font-bold text-green-600 mt-1">
            +{totalIn.toFixed(2)} CT
          </Text>
        </View>

        {/* OUT */}
        <View className="flex-1 bg-red-50 rounded-2xl p-4">
          <Text className="text-xs text-red-400/70">OUT</Text>
          <Text className="text-xl font-bold text-red-400 mt-1">
            -{totalOut.toFixed(2)} CT
          </Text>
        </View>
      </View>

      {/* 🔹 LIST TITLE */}
      <View className="px-6 pb-2">
        <Text className="text-sm font-semibold text-dark/70">
          Purchase History
        </Text>
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

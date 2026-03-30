import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

export interface PackageStock {
  package_id: string;
  package_code: string;
  package_name: string;
  sieve_from?: string;
  sieve_to?: string;
  total_in_ct: number;
  total_out_ct: number;
  current_stock_ct: number;
}

interface StockState {
  packageStock: PackageStock[];
  isLoading: boolean;
  fetchPackageStock: () => Promise<void>;
  subscribeToTransactions: () => () => void;
}

export const useStockStore = create<StockState>((set, get) => ({
  packageStock: [],
  isLoading: false,

  fetchPackageStock: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from("stock_by_package").select("*");
    if (!error && data) set({ packageStock: data });
    set({ isLoading: false });
  },

  subscribeToTransactions: () => {
    const channel = supabase
      .channel("stock_transactions_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "purchases",
        },
        (_payload) => {
          // Refetch package stock whenever any purchase transaction changes
          get().fetchPackageStock();
        },
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

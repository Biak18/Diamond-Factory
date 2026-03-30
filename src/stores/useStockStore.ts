import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

export interface StockSummary {
  warehouse_id: string;
  wh_code: string;
  wh_name: string;
  item_id: string;
  item_code: string;
  item_name: string;
  total_in: number;
  total_out: number;
  current_stock: number;
}

export interface WarehouseStock {
  warehouse_id: string;
  wh_code: string;
  wh_name: string;
  items: StockSummary[];
  totalItems: number;
  totalStock: number;
}

interface StockState {
  summary: StockSummary[];
  isLoading: boolean;
  fetchSummary: () => Promise<void>;
  subscribeToTransactions: () => () => void;
}

export const useStockStore = create<StockState>((set, get) => ({
  summary: [],
  isLoading: false,

  fetchSummary: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from("stock_summary").select("*");
    if (!error && data) set({ summary: data });
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
          table: "stock_transactions",
        },
        (_payload) => {
          // Refetch summary whenever any transaction changes
          get().fetchSummary();
        },
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

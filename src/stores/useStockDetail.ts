import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface StockDetail {
  id: string;
  package_id: string;
  package_code: string;
  package_name: string;
  purchase_code: string;
  supplier_id: string;
  weight_ct: number;
  price_per_ct: number;
  total_price: number;
  currency: "INR" | "USD";
  exchange_rate?: number;
  purchase_date: string;
  supplier_name?: string;
  created_by: string;
  name: string;
  in_ct: number;
  out_ct: number;
  created_at: string;
}

interface StockDetailState {
  stockDetails: StockDetail[];
  isLoading: boolean;
  fetchStockDetails: (id: string) => Promise<void>;
}

export const useStockDetailStore = create<StockDetailState>((set, get) => ({
  stockDetails: [],
  isLoading: false,

  fetchStockDetails: async (id: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from("stock_detail_by_package")
      .select("*")
      .eq("package_id", id)
      .order("purchase_date", { ascending: false });

    if (!error && data) set({ stockDetails: data });
    set({ isLoading: false });
  },
}));

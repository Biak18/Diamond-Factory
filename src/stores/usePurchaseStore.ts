import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Purchase {
  id: string;
  purchase_code: string;
  supplier_id: string;
  package_id: string;
  weight_ct: number;
  currency: "INR" | "USD";
  price_per_ct: number;
  total_price: number;
  exchange_rate?: number;
  purchase_date: string;
  note?: string;
  created_by: string;
  created_at: string;
  // joined
  suppliers?: { name: string; company_name?: string };
  diamond_packages?: { package_code: string; package_name: string };
  profiles?: { name: string };
}

interface PurchaseState {
  purchases: Purchase[];
  isLoading: boolean;
  fetchPurchases: () => Promise<void>;
  addPurchase: (
    p: Omit<
      Purchase,
      | "id"
      | "purchase_code"
      | "created_at"
      | "suppliers"
      | "diamond_packages"
      | "profiles"
    >,
  ) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  isLoading: false,

  fetchPurchases: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("purchases")
      .select(
        `
        *,
        suppliers ( name, company_name ),
        diamond_packages ( package_code, package_name ),
        profiles ( name )
      `,
      )
      .order("created_at", { ascending: true });
    if (!error && data) set({ purchases: data });
    set({ isLoading: false });
  },

  addPurchase: async (p) => {
    const { data, error } = await supabase
      .from("purchases")
      .insert({ ...p, purchase_code: "" })
      .select(
        `
        *,
        suppliers ( name, company_name ),
        diamond_packages ( package_code, package_name ),
        profiles ( name )
      `,
      )
      .single();
    if (!error && data) {
      set({ purchases: [...get().purchases, data] });
    } else {
      throw error;
    }
  },
}));

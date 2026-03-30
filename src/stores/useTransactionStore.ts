import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

export interface Transaction {
  id: string;
  item_id: string;
  warehouse_id: string;
  fg_slip: 1 | 2;
  quantity: number;
  unit_price: number;
  note?: string;
  created_by: string;
  created_at: string;
  // joined
  items?: { item_code: string; item_name: string };
  warehouses?: { wh_code: string; wh_name: string };
  profiles?: { name: string };
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (
    tx: Omit<
      Transaction,
      "id" | "created_at" | "items" | "warehouses" | "profiles"
    >,
  ) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("stock_transactions")
      .select(
        `
        *,
        items ( item_code, item_name ),
        warehouses ( wh_code, wh_name ),
        profiles ( name )
      `,
      )
      // .order("item_id", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) set({ transactions: data });
    set({ isLoading: false });
  },

  addTransaction: async (tx) => {
    //  Check available stock before saving OUT transaction
    if (tx.fg_slip === 2) {
      const { data, error } = await supabase
        .from("stock_summary")
        .select("current_stock")
        .eq("item_id", tx.item_id)
        .eq("warehouse_id", tx.warehouse_id)
        .single();

      if (error || !data) {
        throw new Error("Could not check stock. Please try again.");
      }

      if (data.current_stock <= 0) {
        throw new Error("No stock available.");
      }

      if (data.current_stock < tx.quantity) {
        throw new Error(
          `Not enough stock. Only ${data.current_stock} unit(s) available.`,
        );
      }
    }

    const { data, error } = await supabase
      .from("stock_transactions")
      .insert(tx)
      .select(
        `
        *,
        items ( item_code, item_name ),
        warehouses ( wh_code, wh_name ),
        profiles ( name )
      `,
      )
      .single();

    if (!error && data) {
      // set({ transactions: [data, ...get().transactions] });
      set({ transactions: [...get().transactions, data] });
    } else {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },
}));

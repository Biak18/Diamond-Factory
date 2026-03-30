import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

export interface Warehouse {
  id: string;
  wh_code: string;
  wh_name: string;
  created_at: string;
}

interface WarehouseState {
  warehouses: Warehouse[];
  isLoading: boolean;
  fetchWarehouses: () => Promise<void>;
  addWarehouse: (wh: Omit<Warehouse, "id" | "created_at">) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],
  isLoading: false,

  fetchWarehouses: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) set({ warehouses: data });
    set({ isLoading: false });
  },

  addWarehouse: async (wh) => {
    const { data, error } = await supabase
      .from("warehouses")
      .insert(wh)
      .select()
      .single();
    if (!error && data) {
      // set({ warehouses: [data, ...get().warehouses] });
      set({ warehouses: [...get().warehouses, data] });
    } else {
      throw error;
    }
  },

  deleteWarehouse: async (id) => {
    const { error } = await supabase.from("warehouses").delete().eq("id", id);
    if (!error) {
      set({ warehouses: get().warehouses.filter((w) => w.id !== id) });
    } else {
      throw error;
    }
  },
}));

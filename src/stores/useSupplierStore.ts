import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  company_name?: string;
  created_at: string;
}

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  fetchSuppliers: () => Promise<void>;
  addSupplier: (s: Omit<Supplier, "id" | "created_at">) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,

  fetchSuppliers: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) set({ suppliers: data });
    set({ isLoading: false });
  },

  addSupplier: async (s) => {
    const { data, error } = await supabase
      .from("suppliers")
      .insert(s)
      .select()
      .single();
    if (!error && data) {
      set({ suppliers: [...get().suppliers, data] });
    } else {
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (!error) {
      set({ suppliers: get().suppliers.filter((s) => s.id !== id) });
    } else {
      throw error;
    }
  },
}));

import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

export interface Item {
  id: string;
  item_code: string;
  item_name: string;
  image_url?: string;
  created_at: string;
}

interface ItemState {
  items: Item[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<Item, "id" | "created_at">) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) set({ items: data });
    set({ isLoading: false });
  },

  addItem: async (item) => {
    const { data, error } = await supabase
      .from("items")
      .insert(item)
      .select()
      .single();
    if (!error && data) {
      // set({ items: [data, ...get().items] });
      set({ items: [...get().items, data] });
    } else {
      throw error;
    }
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (!error) {
      set({ items: get().items.filter((i) => i.id !== id) });
    } else {
      throw error;
    }
  },
}));

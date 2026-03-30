import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface DiamondPackage {
  id: string;
  package_code: string;
  package_name: string;
  sieve_from?: string;
  sieve_to?: string;
  note?: string;
  created_at: string;
}

export interface DiamondSize {
  id: string;
  sieve_size: string;
  p_cts?: string;
  weight_per_stone?: number;
  diameter_mm?: string;
  sort_order: number;
}

interface PackageState {
  packages: DiamondPackage[];
  sizes: DiamondSize[];
  isLoading: boolean;
  isSizesLoading: boolean;
  fetchPackages: () => Promise<void>;
  fetchSizes: () => Promise<void>;
  addPackage: (pkg: Omit<DiamondPackage, "id" | "created_at">) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
}

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: [],
  sizes: [],
  isLoading: false,
  isSizesLoading: false,

  fetchPackages: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("diamond_packages")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) set({ packages: data });
    set({ isLoading: false });
  },

  fetchSizes: async () => {
    if (get().sizes.length > 0) return; // already loaded
    set({ isSizesLoading: true });
    const { data, error } = await supabase
      .from("diamond_sizes")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) set({ sizes: data });
    set({ isSizesLoading: false });
  },

  addPackage: async (pkg) => {
    const { data, error } = await supabase
      .from("diamond_packages")
      .insert(pkg)
      .select()
      .single();
    if (!error && data) {
      set({ packages: [...get().packages, data] });
    } else {
      throw error;
    }
  },

  deletePackage: async (id) => {
    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("package_id", id);

    if (count && count > 0) {
      throw new Error(
        `Cannot delete — this package is used in ${count} purchase(s).`,
      );
    }

    const { error } = await supabase
      .from("diamond_packages")
      .delete()
      .eq("id", id);

    if (!error) {
      set({ packages: get().packages.filter((p) => p.id !== id) });
    } else {
      throw error;
    }
  },
}));

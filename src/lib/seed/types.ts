import type { ModuleCategory } from "@/lib/supabase/types";

export type SeedModule = {
  category: ModuleCategory;
  variant_key: string;
  weight: number;
  body: string;
};

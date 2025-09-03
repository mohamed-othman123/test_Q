export interface InventoryItem {
  id: number;
  name: string;
  name_ar: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  description: string | null;
  reason?: string;
  halls: {
    id?: number;
    name?: string;
    name_ar?: string;
  }[];
  hallId?: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_by: number;
  deleted_at: string;
  deleted: boolean;
}

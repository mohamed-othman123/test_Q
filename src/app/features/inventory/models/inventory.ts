export interface InventoryItem {
  id: number;
  name: string;
  name_ar: string;
  unitPrice: number;
  quantity: number;
  reorderLevel: number;
  description: string | null;
  reason?: string;
  totalQuantity?: number;
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

export interface InventoryItemBatch {
  created_at: string;
  created_by: number;
  deleted: boolean;
  deleted_at: string;
  deleted_by: string;
  id: number;
  quantity: number;
  remainingQuantity: number;
  unitPrice: number;
  updated_at: string;
  updated_by: string;
}

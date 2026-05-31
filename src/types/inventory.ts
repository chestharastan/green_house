export type ItemCategory = "Seeds" | "Nutrients" | "GrowingMedia" | "Equipment" | "Chemicals" | "Packaging";
export type UsageAction = "Consumed" | "Restocked" | "Adjusted" | "Wasted";

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  supplier?: string;
  lastRestockedAt?: string;
}

export interface UsageRecord {
  id: string;
  itemId: string;
  action: UsageAction;
  quantity: number;
  stockAfter: number;
  performedBy: string;
  batchId?: string;
  recordedAt: string;
  notes?: string;
}

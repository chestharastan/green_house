import type { User } from "@/types/auth"
import type { Greenhouse, WaterBed } from "@/types/greenhouse"
import type { CropType, CropBatch, HarvestRecord } from "@/types/crop"
import type { InventoryItem, UsageRecord } from "@/types/inventory"
import type { Task, WorkHourRecord } from "@/types/labor"
import type { BedMonitoringRecord } from "@/types/monitoring"

// ─── Users ────────────────────────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: "u1", name: "Admin User", email: "admin@greenhouse.com", role: "Admin", isActive: true, createdAt: "2024-01-01" },
  { id: "u2", name: "Sara Chen", email: "sara@greenhouse.com", role: "FarmManager", isActive: true, createdAt: "2024-01-05" },
  { id: "u3", name: "Dara Kim", email: "dara@greenhouse.com", role: "Worker", isActive: true, createdAt: "2024-02-01" },
  { id: "u4", name: "Tom Nguyen", email: "tom@greenhouse.com", role: "Worker", isActive: true, createdAt: "2024-02-10" },
  { id: "u5", name: "Mia Park", email: "mia@greenhouse.com", role: "Worker", isActive: false, createdAt: "2024-03-01" },
]

// ─── Greenhouses ──────────────────────────────────────────────────────────────
export const mockGreenhouses: Greenhouse[] = [
  { id: "gh1", name: "GH1 - Main", location: "North Block", squareMeters: 500, isActive: true, notes: "Primary production greenhouse" },
  { id: "gh2", name: "GH2 - Nursery", location: "South Block", squareMeters: 200, isActive: true, notes: "Seedling nursery" },
]

export const mockWaterBeds: WaterBed[] = [
  { id: "bed1", greenhouseId: "gh1", bedCode: "BED01", lengthM: 10, widthM: 1.5, status: "Active", currentBatchId: "batch1" },
  { id: "bed2", greenhouseId: "gh1", bedCode: "BED02", lengthM: 10, widthM: 1.5, status: "Active", currentBatchId: "batch2" },
  { id: "bed3", greenhouseId: "gh1", bedCode: "BED03", lengthM: 8, widthM: 1.2, status: "Active", currentBatchId: "batch3" },
  { id: "bed4", greenhouseId: "gh1", bedCode: "BED04", lengthM: 8, widthM: 1.2, status: "Idle" },
  { id: "bed5", greenhouseId: "gh2", bedCode: "BED05", lengthM: 6, widthM: 1.0, status: "Active", currentBatchId: "batch4" },
  { id: "bed6", greenhouseId: "gh2", bedCode: "BED06", lengthM: 6, widthM: 1.0, status: "Maintenance" },
]

// ─── Crops ────────────────────────────────────────────────────────────────────
export const mockCropTypes: CropType[] = [
  { id: "ct1", name: "Lettuce", category: "Leafy", averageDaysToHarvest: 35, notes: "Butterhead variety" },
  { id: "ct2", name: "Basil", category: "Herb", averageDaysToHarvest: 28, notes: "Sweet basil" },
  { id: "ct3", name: "Spinach", category: "Leafy", averageDaysToHarvest: 40, notes: "Baby spinach" },
  { id: "ct4", name: "Cherry Tomato", category: "Fruiting", averageDaysToHarvest: 70, notes: "Indeterminate variety" },
]

export const mockCropBatches: CropBatch[] = [
  {
    id: "batch1", batchCode: "LT-2024-001", cropTypeId: "ct1", bedId: "bed1",
    currentStage: "Growing", seedlingCount: 120, startedAt: "2024-02-20",
    estimatedHarvestDate: "2024-03-26", managerId: "u2",
    stageHistory: [
      { stage: "Seed", startedAt: "2024-02-20", completedAt: "2024-02-22" },
      { stage: "Germination", startedAt: "2024-02-22", completedAt: "2024-02-28" },
      { stage: "Transplanting", startedAt: "2024-02-28", completedAt: "2024-03-02" },
      { stage: "Growing", startedAt: "2024-03-02" },
    ],
    notes: "First batch of the season",
  },
  {
    id: "batch2", batchCode: "BS-2024-001", cropTypeId: "ct2", bedId: "bed2",
    currentStage: "Transplanting", seedlingCount: 80, startedAt: "2024-02-28",
    estimatedHarvestDate: "2024-03-27", managerId: "u2",
    stageHistory: [
      { stage: "Seed", startedAt: "2024-02-28", completedAt: "2024-03-02" },
      { stage: "Germination", startedAt: "2024-03-02", completedAt: "2024-03-06" },
      { stage: "Transplanting", startedAt: "2024-03-06" },
    ],
  },
  {
    id: "batch3", batchCode: "SP-2024-001", cropTypeId: "ct3", bedId: "bed3",
    currentStage: "Germination", seedlingCount: 200, startedAt: "2024-03-04",
    estimatedHarvestDate: "2024-04-13", managerId: "u2",
    stageHistory: [
      { stage: "Seed", startedAt: "2024-03-04", completedAt: "2024-03-06" },
      { stage: "Germination", startedAt: "2024-03-06" },
    ],
  },
  {
    id: "batch4", batchCode: "LT-2024-002", cropTypeId: "ct1", bedId: "bed5",
    currentStage: "Harvest", seedlingCount: 90, startedAt: "2024-01-20",
    estimatedHarvestDate: "2024-02-24", managerId: "u2",
    stageHistory: [
      { stage: "Seed", startedAt: "2024-01-20", completedAt: "2024-01-22" },
      { stage: "Germination", startedAt: "2024-01-22", completedAt: "2024-01-28" },
      { stage: "Transplanting", startedAt: "2024-01-28", completedAt: "2024-01-30" },
      { stage: "Growing", startedAt: "2024-01-30", completedAt: "2024-02-20" },
      { stage: "Harvest", startedAt: "2024-02-20" },
    ],
  },
]

export const mockHarvestRecords: HarvestRecord[] = [
  { id: "hr1", batchId: "batch4", harvestedAt: "2024-02-24", yieldKg: 27.5, qualityRating: 5, harvestedBy: "u3", notes: "Excellent quality, full heads" },
  { id: "hr2", batchId: "batch1", harvestedAt: "2024-01-15", yieldKg: 18.2, qualityRating: 4, harvestedBy: "u3", notes: "Good yield" },
  { id: "hr3", batchId: "batch2", harvestedAt: "2024-01-28", yieldKg: 9.6, qualityRating: 4, harvestedBy: "u4", notes: "Aromatic, good density" },
]

// ─── Inventory ─────────────────────────────────────────────────────────────────
export const mockInventory: InventoryItem[] = [
  { id: "inv1", name: "Lettuce Seeds", category: "Seeds", unit: "g", currentStock: 850, minimumStock: 200, unitCost: 0.05, supplier: "SeedCo", lastRestockedAt: "2024-02-15" },
  { id: "inv2", name: "Basil Seeds", category: "Seeds", unit: "g", currentStock: 320, minimumStock: 100, unitCost: 0.08, supplier: "SeedCo", lastRestockedAt: "2024-02-15" },
  { id: "inv3", name: "Nutrient A (Grow)", category: "Nutrients", unit: "L", currentStock: 8, minimumStock: 5, unitCost: 12.5, supplier: "HydroNutrients", lastRestockedAt: "2024-02-20" },
  { id: "inv4", name: "Nutrient B (Bloom)", category: "Nutrients", unit: "L", currentStock: 3, minimumStock: 5, unitCost: 14.0, supplier: "HydroNutrients", lastRestockedAt: "2024-01-30" },
  { id: "inv5", name: "Rockwool Cubes", category: "GrowingMedia", unit: "pcs", currentStock: 500, minimumStock: 200, unitCost: 0.3, supplier: "GrowMedia Co", lastRestockedAt: "2024-02-10" },
  { id: "inv6", name: "pH Up Solution", category: "Chemicals", unit: "L", currentStock: 2, minimumStock: 1, unitCost: 8.0, supplier: "ChemFarm", lastRestockedAt: "2024-01-20" },
  { id: "inv7", name: "pH Down Solution", category: "Chemicals", unit: "L", currentStock: 1.5, minimumStock: 1, unitCost: 8.0, supplier: "ChemFarm", lastRestockedAt: "2024-01-20" },
  { id: "inv8", name: "EC Meter", category: "Equipment", unit: "pcs", currentStock: 3, minimumStock: 2, unitCost: 45.0, supplier: "FarmTools", lastRestockedAt: "2023-12-01" },
  { id: "inv9", name: "Harvest Bags", category: "Packaging", unit: "pcs", currentStock: 200, minimumStock: 100, unitCost: 0.1, supplier: "PackPro", lastRestockedAt: "2024-02-01" },
  { id: "inv10", name: "Spinach Seeds", category: "Seeds", unit: "g", currentStock: 150, minimumStock: 200, unitCost: 0.06, supplier: "SeedCo", lastRestockedAt: "2024-01-15" },
]

export const mockUsageRecords: UsageRecord[] = [
  { id: "ur1", itemId: "inv1", action: "Consumed", quantity: 50, stockAfter: 850, performedBy: "u3", batchId: "batch3", recordedAt: "2024-03-04", notes: "Seeding SP-2024-001" },
  { id: "ur2", itemId: "inv3", action: "Consumed", quantity: 2, stockAfter: 8, performedBy: "u3", recordedAt: "2024-03-07", notes: "Weekly nutrient top-up" },
  { id: "ur3", itemId: "inv4", action: "Restocked", quantity: 5, stockAfter: 8, performedBy: "u2", recordedAt: "2024-02-20" },
  { id: "ur4", itemId: "inv5", action: "Consumed", quantity: 100, stockAfter: 500, performedBy: "u4", batchId: "batch3", recordedAt: "2024-03-04" },
]

// ─── Labor ─────────────────────────────────────────────────────────────────────
export const mockTasks: Task[] = [
  { id: "t1", title: "Transplant Lettuce LT-2024-001", description: "Move seedlings from nursery to BED01", status: "Done", priority: "High", assignedTo: "u3", createdBy: "u2", dueDate: "2024-03-02", createdAt: "2024-02-28", completedAt: "2024-03-02" },
  { id: "t2", title: "Record BED01 monitoring", description: "Daily pH and EC check for BED01", status: "Done", priority: "Medium", assignedTo: "u3", createdBy: "u2", dueDate: "2024-03-07", createdAt: "2024-03-07", completedAt: "2024-03-07" },
  { id: "t3", title: "Restock Nutrient B", description: "Order and restock Nutrient B (Bloom) - stock is low", status: "InProgress", priority: "Urgent", assignedTo: "u2", createdBy: "u1", dueDate: "2024-03-09", createdAt: "2024-03-08" },
  { id: "t4", title: "Harvest LT-2024-002", description: "Full harvest of BED05 crop batch", status: "Done", priority: "High", assignedTo: "u4", createdBy: "u2", dueDate: "2024-02-24", createdAt: "2024-02-22", completedAt: "2024-02-24" },
  { id: "t5", title: "Clean and sanitize BED04", description: "Prepare BED04 for next crop cycle", status: "Pending", priority: "Low", assignedTo: "u3", createdBy: "u2", dueDate: "2024-03-15", createdAt: "2024-03-08" },
  { id: "t6", title: "Transplant Basil BS-2024-001", description: "Move basil seedlings to BED02", status: "InProgress", priority: "High", assignedTo: "u4", createdBy: "u2", dueDate: "2024-03-08", createdAt: "2024-03-06" },
]

export const mockWorkHours: WorkHourRecord[] = [
  { id: "wh1", workerId: "u3", taskId: "t1", clockIn: "2024-03-02T08:00", clockOut: "2024-03-02T12:00", hoursLogged: 4, notes: "Transplant completed successfully" },
  { id: "wh2", workerId: "u4", taskId: "t4", clockIn: "2024-02-24T07:00", clockOut: "2024-02-24T14:00", hoursLogged: 7, notes: "Full harvest of BED05" },
  { id: "wh3", workerId: "u3", taskId: "t2", clockIn: "2024-03-07T08:00", clockOut: "2024-03-07T09:00", hoursLogged: 1, notes: "Morning monitoring rounds" },
  { id: "wh4", workerId: "u4", taskId: "t6", clockIn: "2024-03-07T08:00", clockOut: "2024-03-07T11:00", hoursLogged: 3, notes: "Partial transplant done" },
]

// ─── Monitoring ───────────────────────────────────────────────────────────────
export const mockMonitoringRecords: BedMonitoringRecord[] = [
  { id: "m1", bedId: "bed1", recordedAt: "2024-03-07T08:30", recordedBy: "u3", pH: 6.1, ec: 1.8, waterTempC: 22, waterLevelCm: 12, phStatus: "Normal", ecStatus: "Normal", tempStatus: "Normal" },
  { id: "m2", bedId: "bed2", recordedAt: "2024-03-07T08:45", recordedBy: "u3", pH: 5.9, ec: 2.1, waterTempC: 23, waterLevelCm: 11, phStatus: "Normal", ecStatus: "Normal", tempStatus: "Normal" },
  { id: "m3", bedId: "bed3", recordedAt: "2024-03-07T09:00", recordedBy: "u3", pH: 6.8, ec: 1.5, waterTempC: 24, waterLevelCm: 10, phStatus: "Warning", ecStatus: "Normal", tempStatus: "Normal", notes: "pH slightly high, adjusted" },
  { id: "m4", bedId: "bed5", recordedAt: "2024-03-07T09:15", recordedBy: "u3", pH: 6.0, ec: 2.8, waterTempC: 21, waterLevelCm: 13, phStatus: "Normal", ecStatus: "Warning", tempStatus: "Normal", notes: "EC elevated" },
  { id: "m5", bedId: "bed1", recordedAt: "2024-03-06T08:30", recordedBy: "u4", pH: 6.2, ec: 1.7, waterTempC: 22, waterLevelCm: 12, phStatus: "Normal", ecStatus: "Normal", tempStatus: "Normal" },
  { id: "m6", bedId: "bed2", recordedAt: "2024-03-06T08:45", recordedBy: "u4", pH: 7.1, ec: 1.6, waterTempC: 27, waterLevelCm: 9, phStatus: "Critical", ecStatus: "Normal", tempStatus: "Warning", notes: "pH critical — corrected immediately" },
]

// ─── Utilities ────────────────────────────────────────────────────────────────
export type UtilityRecord = {
  id: string
  date: string
  waterLiters: number
  electricityKwh: number
  nutrientLiters: number
  recordedBy: string
  notes?: string
}

export const mockUtilityRecords: UtilityRecord[] = [
  { id: "util1", date: "2024-03-07", waterLiters: 320, electricityKwh: 14.2, nutrientLiters: 3.5, recordedBy: "u3" },
  { id: "util2", date: "2024-03-06", waterLiters: 310, electricityKwh: 13.8, nutrientLiters: 3.2, recordedBy: "u3" },
  { id: "util3", date: "2024-03-05", waterLiters: 295, electricityKwh: 13.5, nutrientLiters: 3.0, recordedBy: "u4" },
  { id: "util4", date: "2024-03-04", waterLiters: 330, electricityKwh: 14.5, nutrientLiters: 3.8, recordedBy: "u3" },
  { id: "util5", date: "2024-03-03", waterLiters: 280, electricityKwh: 13.0, nutrientLiters: 2.9, recordedBy: "u4" },
  { id: "util6", date: "2024-03-02", waterLiters: 300, electricityKwh: 13.2, nutrientLiters: 3.1, recordedBy: "u3" },
  { id: "util7", date: "2024-03-01", waterLiters: 315, electricityKwh: 14.0, nutrientLiters: 3.3, recordedBy: "u3" },
]

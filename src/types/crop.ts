export type CropStage = "Seed" | "Germination" | "Transplanting" | "Growing" | "Harvest" | "Completed";

export interface CropType {
  id: string;
  name: string;
  category: "Leafy" | "Herb" | "Fruiting" | "Root";
  averageDaysToHarvest: number;
  notes?: string;
}

export interface StageDateRecord {
  stage: CropStage;
  startedAt: string;
  completedAt?: string;
}

export interface CropBatch {
  id: string;
  batchCode: string;
  cropTypeId: string;
  currentStage: CropStage;
  stageHistory: StageDateRecord[];
  bedId?: string;
  seedlingCount: number;
  startedAt: string;
  estimatedHarvestDate: string;
  managerId: string;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  batchId: string;
  harvestedAt: string;
  yieldKg: number;
  qualityRating: 1 | 2 | 3 | 4 | 5;
  harvestedBy: string;
  notes?: string;
}

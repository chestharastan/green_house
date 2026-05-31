export interface Greenhouse {
  id: string;
  name: string;
  location: string;
  squareMeters: number;
  isActive: boolean;
  notes?: string;
}

export type BedStatus = "Active" | "Idle" | "Maintenance";

export interface WaterBed {
  id: string;
  greenhouseId: string;
  bedCode: string;
  lengthM: number;
  widthM: number;
  status: BedStatus;
  currentBatchId?: string;
}

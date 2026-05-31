export type ReadingStatus = "Normal" | "Warning" | "Critical";

export interface BedMonitoringRecord {
  id: string;
  bedId: string;
  recordedAt: string;
  recordedBy: string;
  pH: number;
  ec: number;
  waterTempC: number;
  waterLevelCm: number;
  phStatus: ReadingStatus;
  ecStatus: ReadingStatus;
  tempStatus: ReadingStatus;
  notes?: string;
}

export const CROP_STAGES = ["Seed", "Germination", "Transplanting", "Growing", "Harvest", "Completed"] as const;
export const ITEM_CATEGORIES = ["Seeds", "Nutrients", "GrowingMedia", "Equipment", "Chemicals", "Packaging"] as const;
export const TASK_STATUSES = ["Pending", "InProgress", "Done", "Cancelled"] as const;
export const USER_ROLES = ["Admin", "FarmManager", "Worker"] as const;
export const UTILITY_TYPES = ["Water", "Electricity", "Nutrient"] as const;

export const PH_RANGE = { min: 5.5, max: 6.5 };
export const EC_RANGE = { min: 1.5, max: 3.0 };
export const TEMP_RANGE = { min: 18, max: 26 };

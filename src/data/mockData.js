// Mock data for the Hydroponic Farm Management System MVP.
// Mirrors the ERD entities. All data lives in memory (DataContext); records
// you add appear for the current session and reset on page refresh.

export const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Farm Manager' },
  { id: 3, name: 'Worker' },
]

// Demo accounts. Password is the same as the username for every account.
export const users = [
  { id: 1, username: 'admin', password: 'admin', fullName: 'System Admin', roleId: 1 },
  { id: 2, username: 'manager', password: 'manager', fullName: 'Sokha Chan', roleId: 2 },
  { id: 3, username: 'worker', password: 'worker', fullName: 'Dara Pich', roleId: 3 },
]

export const greenhouses = [
  { id: 1, name: 'GH-A North', location: 'Niset Farm - Block A', type: 'Hydroponic', areaSize: 240, numberOfBeds: 12, status: 'Active' },
  { id: 2, name: 'GH-B East', location: 'Niset Farm - Block B', type: 'Hydroponic', areaSize: 180, numberOfBeds: 9, status: 'Active' },
  { id: 3, name: 'GH-C Nursery', location: 'Niset Farm - Block C', type: 'Soil-based', areaSize: 90, numberOfBeds: 6, status: 'Maintenance' },
]

export const cropBatches = [
  { id: 1, code: 'BATCH-1001', greenhouseId: 1, cropType: 'Lettuce (Vegetable)', plantingDate: '2026-05-02', harvestDate: '2026-06-06', stage: 'Growing', quantity: 800, status: 'Active' },
  { id: 2, code: 'BATCH-1002', greenhouseId: 1, cropType: 'Basil (Vegetable)', plantingDate: '2026-05-10', harvestDate: '2026-06-02', stage: 'Growing', quantity: 500, status: 'Active' },
  { id: 3, code: 'BATCH-1003', greenhouseId: 2, cropType: 'Strawberry (Fruit)', plantingDate: '2026-04-20', harvestDate: '2026-06-01', stage: 'Harvest', quantity: 350, status: 'Active' },
  { id: 4, code: 'BATCH-1004', greenhouseId: 2, cropType: 'Pak Choi (Vegetable)', plantingDate: '2026-05-25', harvestDate: '2026-06-20', stage: 'Transplanting', quantity: 600, status: 'Active' },
  { id: 5, code: 'BATCH-1005', greenhouseId: 3, cropType: 'Kale (Vegetable)', plantingDate: '2026-05-28', harvestDate: '2026-07-01', stage: 'Germination', quantity: 400, status: 'Active' },
]

export const cropStages = ['Germination', 'Transplanting', 'Growing', 'Harvest']

export const cropStageLogs = [
  { id: 1, batchId: 1, stage: 'Germination', logDate: '2026-05-02', note: 'Seeds sown in rockwool.' },
  { id: 2, batchId: 1, stage: 'Transplanting', logDate: '2026-05-09', note: 'Moved to NFT channels.' },
  { id: 3, batchId: 1, stage: 'Growing', logDate: '2026-05-16', note: 'Healthy growth, EC 1.8.' },
  { id: 4, batchId: 3, stage: 'Harvest', logDate: '2026-05-30', note: 'First pick ready.' },
  { id: 5, batchId: 5, stage: 'Germination', logDate: '2026-05-28', note: 'Tray seeded.' },
]

export const workers = [
  { id: 1, fullName: 'Dara Pich', phone: '012 345 678', position: 'Laborer', hourlyRate: 2.5, status: 'Active', userId: 3 },
  { id: 2, fullName: 'Sreypov Heng', phone: '011 222 333', position: 'Technician', hourlyRate: 3.5, status: 'Active', userId: null },
  { id: 3, fullName: 'Vichea Sok', phone: '015 888 999', position: 'Laborer', hourlyRate: 2.5, status: 'Active', userId: null },
  { id: 4, fullName: 'Bopha Nuon', phone: '010 444 555', position: 'Harvester', hourlyRate: 2.75, status: 'On Leave', userId: null },
]

export const workerTasks = [
  { id: 1, workerId: 1, greenhouseId: 1, taskType: 'Watering', description: 'Check NFT flow on beds 1-6', dueDate: '2026-05-31', status: 'Pending' },
  { id: 2, workerId: 2, greenhouseId: 1, taskType: 'Maintenance', description: 'Calibrate pH dosing pump', dueDate: '2026-05-31', status: 'In Progress' },
  { id: 3, workerId: 3, greenhouseId: 2, taskType: 'Harvesting', description: 'Harvest ready strawberries', dueDate: '2026-05-31', status: 'Pending' },
  { id: 4, workerId: 1, greenhouseId: 2, taskType: 'Planting', description: 'Transplant Pak Choi seedlings', dueDate: '2026-06-01', status: 'Pending' },
  { id: 5, workerId: 4, greenhouseId: 3, taskType: 'Disinfection', description: 'Clean nursery trays', dueDate: '2026-05-29', status: 'Done' },
]

export const workHours = [
  { id: 1, workerId: 1, date: '2026-05-30', hours: 8, taskType: 'Watering' },
  { id: 2, workerId: 2, date: '2026-05-30', hours: 7.5, taskType: 'Maintenance' },
  { id: 3, workerId: 3, date: '2026-05-30', hours: 8, taskType: 'Harvesting' },
  { id: 4, workerId: 1, date: '2026-05-31', hours: 4, taskType: 'Watering' },
]

export const inventoryItems = [
  { id: 1, name: 'Lettuce Seeds', category: 'Seeds', unit: 'pack', quantity: 40, reorderLevel: 15, costPerUnit: 3.0 },
  { id: 2, name: 'NPK Nutrient A', category: 'Nutrients', unit: 'L', quantity: 12, reorderLevel: 20, costPerUnit: 5.5 },
  { id: 3, name: 'NPK Nutrient B', category: 'Nutrients', unit: 'L', quantity: 18, reorderLevel: 20, costPerUnit: 5.5 },
  { id: 4, name: 'pH Down Solution', category: 'pH Solution', unit: 'L', quantity: 6, reorderLevel: 10, costPerUnit: 4.0 },
  { id: 5, name: 'Rockwool Cubes', category: 'Growing Media', unit: 'box', quantity: 25, reorderLevel: 10, costPerUnit: 8.0 },
  { id: 6, name: 'Disinfectant', category: 'Disinfection', unit: 'L', quantity: 9, reorderLevel: 10, costPerUnit: 6.0 },
]

export const inventoryTransactions = [
  { id: 1, itemId: 2, type: 'OUT', quantity: 4, date: '2026-05-30', note: 'Dosing GH-A reservoir' },
  { id: 2, itemId: 1, type: 'IN', quantity: 20, date: '2026-05-28', note: 'Supplier delivery' },
  { id: 3, itemId: 4, type: 'OUT', quantity: 2, date: '2026-05-29', note: 'pH correction GH-B' },
  { id: 4, itemId: 5, type: 'IN', quantity: 15, date: '2026-05-27', note: 'Restock nursery' },
]

export const sensorRecords = [
  { id: 1, greenhouseId: 1, type: 'Air Temperature', value: 27.4, unit: '°C', recordedAt: '2026-05-31 07:30' },
  { id: 2, greenhouseId: 1, type: 'Air Humidity', value: 68, unit: '%', recordedAt: '2026-05-31 07:30' },
  { id: 3, greenhouseId: 1, type: 'pH Level', value: 6.1, unit: 'pH', recordedAt: '2026-05-31 07:30' },
  { id: 4, greenhouseId: 1, type: 'EC Level', value: 1.8, unit: 'mS/cm', recordedAt: '2026-05-31 07:30' },
  { id: 5, greenhouseId: 2, type: 'Water Temperature', value: 24.2, unit: '°C', recordedAt: '2026-05-31 07:15' },
  { id: 6, greenhouseId: 2, type: 'CO₂ Level', value: 540, unit: 'ppm', recordedAt: '2026-05-31 07:15' },
  { id: 7, greenhouseId: 2, type: 'Light Intensity', value: 18500, unit: 'lux', recordedAt: '2026-05-31 07:15' },
]

export const sensorTypes = [
  'Air Temperature', 'Air Humidity', 'pH Level', 'EC Level',
  'Water Temperature', 'Water Level', 'CO₂ Level', 'Light Intensity', 'Flow Rate',
]

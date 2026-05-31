import { createContext, useContext, useState } from 'react'
import * as mock from '../data/mockData'

const DataContext = createContext(null)

// All collections start from the mock seed data and live in React state only.
// Adding a record updates state, so it shows immediately — but because nothing
// is persisted, a page refresh resets everything back to the seed ("shown once").
export function DataProvider({ children }) {
  const [greenhouses, setGreenhouses] = useState(mock.greenhouses)
  const [cropBatches, setCropBatches] = useState(mock.cropBatches)
  const [cropStageLogs, setCropStageLogs] = useState(mock.cropStageLogs)
  const [workers, setWorkers] = useState(mock.workers)
  const [workerTasks, setWorkerTasks] = useState(mock.workerTasks)
  const [workHours, setWorkHours] = useState(mock.workHours)
  const [inventoryItems, setInventoryItems] = useState(mock.inventoryItems)
  const [inventoryTransactions, setInventoryTransactions] = useState(mock.inventoryTransactions)
  const [sensorRecords, setSensorRecords] = useState(mock.sensorRecords)

  const nextId = (list) => (list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1)

  // Generic "add to front of list" helpers.
  const add = (setter) => (record) =>
    setter((list) => [{ id: nextId(list), ...record }, ...list])

  // Stock in/out also adjusts the linked item quantity.
  function addInventoryTransaction(tx) {
    setInventoryTransactions((list) => [{ id: nextId(list), ...tx }, ...list])
    setInventoryItems((items) =>
      items.map((it) =>
        it.id === Number(tx.itemId)
          ? {
              ...it,
              quantity:
                tx.type === 'IN'
                  ? it.quantity + Number(tx.quantity)
                  : it.quantity - Number(tx.quantity),
            }
          : it
      )
    )
  }

  // Adding a stage log advances the batch's current stage too.
  function addCropStageLog(log) {
    setCropStageLogs((list) => [{ id: nextId(list), ...log }, ...list])
    setCropBatches((batches) =>
      batches.map((b) =>
        b.id === Number(log.batchId) ? { ...b, stage: log.stage } : b
      )
    )
  }

  const value = {
    roles: mock.roles,
    cropStages: mock.cropStages,
    sensorTypes: mock.sensorTypes,

    greenhouses, addGreenhouse: add(setGreenhouses),
    cropBatches, addCropBatch: add(setCropBatches),
    cropStageLogs, addCropStageLog,
    workers, addWorker: add(setWorkers),
    workerTasks, addWorkerTask: add(setWorkerTasks),
    workHours, addWorkHour: add(setWorkHours),
    inventoryItems, addInventoryItem: add(setInventoryItems),
    inventoryTransactions, addInventoryTransaction,
    sensorRecords, addSensorRecord: add(setSensorRecords),
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}

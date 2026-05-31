import { useData } from '../context/DataContext'
import { PageHeader, StatCard, Table, Badge } from '../components/ui'

const TODAY = '2026-05-31'

export default function Dashboard() {
  const {
    greenhouses, cropBatches, workerTasks, workers,
    inventoryItems, sensorRecords,
  } = useData()

  const activeBatches = cropBatches.filter((b) => b.status === 'Active')
  const todayTasks = workerTasks.filter((t) => t.dueDate === TODAY)
  const lowStock = inventoryItems.filter((i) => i.quantity <= i.reorderLevel)
  const upcomingHarvests = cropBatches
    .filter((b) => b.harvestDate >= TODAY)
    .sort((a, b) => a.harvestDate.localeCompare(b.harvestDate))
    .slice(0, 5)
  const latestSensors = [...sensorRecords]
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, 6)

  const ghName = (id) => greenhouses.find((g) => g.id === id)?.name ?? '—'
  const workerName = (id) => workers.find((w) => w.id === id)?.fullName ?? '—'

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Daily overview — ${TODAY}`} />

      <div className="stat-grid">
        <StatCard label="Greenhouses" value={greenhouses.length} accent="#16a34a" />
        <StatCard label="Active Crop Batches" value={activeBatches.length} accent="#0ea5e9" />
        <StatCard label="Today's Tasks" value={todayTasks.length} accent="#f59e0b" />
        <StatCard label="Low Stock Items" value={lowStock.length} accent="#ef4444" />
        <StatCard label="Upcoming Harvests" value={upcomingHarvests.length} accent="#a855f7" />
        <StatCard label="Workers" value={workers.length} accent="#6366f1" />
      </div>

      <div className="dash-grid">
        <section>
          <h2 className="section-title">Today's Tasks</h2>
          <Table
            empty="No tasks scheduled for today."
            columns={[
              { key: 'worker', header: 'Worker', render: (r) => workerName(r.workerId) },
              { key: 'taskType', header: 'Type' },
              { key: 'description', header: 'Description' },
              { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            ]}
            rows={todayTasks}
          />
        </section>

        <section>
          <h2 className="section-title">Low Stock Items</h2>
          <Table
            empty="All stock levels are healthy."
            columns={[
              { key: 'name', header: 'Item' },
              { key: 'quantity', header: 'Qty', render: (r) => `${r.quantity} ${r.unit}` },
              { key: 'reorderLevel', header: 'Reorder ≤' },
            ]}
            rows={lowStock}
          />
        </section>

        <section>
          <h2 className="section-title">Upcoming Harvests</h2>
          <Table
            empty="No upcoming harvests."
            columns={[
              { key: 'code', header: 'Batch' },
              { key: 'cropType', header: 'Crop' },
              { key: 'greenhouse', header: 'Greenhouse', render: (r) => ghName(r.greenhouseId) },
              { key: 'harvestDate', header: 'Harvest Date' },
            ]}
            rows={upcomingHarvests}
          />
        </section>

        <section>
          <h2 className="section-title">Latest Sensor Readings</h2>
          <Table
            empty="No sensor readings."
            columns={[
              { key: 'greenhouse', header: 'Greenhouse', render: (r) => ghName(r.greenhouseId) },
              { key: 'type', header: 'Type' },
              { key: 'value', header: 'Reading', render: (r) => `${r.value} ${r.unit}` },
              { key: 'recordedAt', header: 'Time' },
            ]}
            rows={latestSensors}
          />
        </section>
      </div>
    </div>
  )
}

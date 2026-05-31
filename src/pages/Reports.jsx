import { useData } from '../context/DataContext'
import { PageHeader, Table, StatCard } from '../components/ui'

export default function Reports() {
  const {
    cropBatches, greenhouses, workHours, workers,
    inventoryItems, inventoryTransactions,
  } = useData()

  // Production by greenhouse
  const byGreenhouse = greenhouses.map((g) => {
    const batches = cropBatches.filter((b) => b.greenhouseId === g.id)
    return {
      id: g.id, name: g.name,
      batches: batches.length,
      plants: batches.reduce((s, b) => s + (b.quantity || 0), 0),
    }
  })

  // Labor hours by worker
  const laborByWorker = workers.map((w) => {
    const hrs = workHours.filter((h) => h.workerId === w.id).reduce((s, h) => s + Number(h.hours), 0)
    return { id: w.id, name: w.fullName, hours: hrs, pay: hrs * w.hourlyRate }
  }).filter((r) => r.hours > 0)

  const totalLaborCost = laborByWorker.reduce((s, r) => s + r.pay, 0)
  const inventoryValue = inventoryItems.reduce((s, i) => s + i.quantity * i.costPerUnit, 0)
  const totalPlants = cropBatches.reduce((s, b) => s + (b.quantity || 0), 0)
  const stockOutCount = inventoryTransactions.filter((t) => t.type === 'OUT').length

  return (
    <div>
      <PageHeader title="Reports" subtitle="Basic MVP summaries" />

      <div className="stat-grid">
        <StatCard label="Total Plants in Production" value={totalPlants} accent="#16a34a" />
        <StatCard label="Inventory Value" value={`$${inventoryValue.toFixed(2)}`} accent="#0ea5e9" />
        <StatCard label="Labor Cost (logged)" value={`$${totalLaborCost.toFixed(2)}`} accent="#f59e0b" />
        <StatCard label="Stock-Out Events" value={stockOutCount} accent="#ef4444" />
      </div>

      <div className="dash-grid">
        <section>
          <h2 className="section-title">Production by Greenhouse</h2>
          <Table
            columns={[
              { key: 'name', header: 'Greenhouse' },
              { key: 'batches', header: 'Batches' },
              { key: 'plants', header: 'Plants' },
            ]}
            rows={byGreenhouse}
          />
        </section>

        <section>
          <h2 className="section-title">Labor Hours Summary</h2>
          <Table
            empty="No work hours logged."
            columns={[
              { key: 'name', header: 'Worker' },
              { key: 'hours', header: 'Hours' },
              { key: 'pay', header: 'Est. Pay', render: (r) => `$${r.pay.toFixed(2)}` },
            ]}
            rows={laborByWorker}
          />
        </section>

        <section>
          <h2 className="section-title">Inventory Valuation</h2>
          <Table
            columns={[
              { key: 'name', header: 'Item' },
              { key: 'quantity', header: 'Qty', render: (r) => `${r.quantity} ${r.unit}` },
              { key: 'value', header: 'Value', render: (r) => `$${(r.quantity * r.costPerUnit).toFixed(2)}` },
            ]}
            rows={inventoryItems}
          />
        </section>
      </div>
    </div>
  )
}

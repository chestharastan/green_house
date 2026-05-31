import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function CropBatches() {
  const { cropBatches, greenhouses, cropStages, addCropBatch } = useData()
  const [open, setOpen] = useState(false)
  const ghName = (id) => greenhouses.find((g) => g.id === id)?.name ?? '—'

  return (
    <div>
      <PageHeader
        title="Crop Batches"
        subtitle="Track planting batches and their lifecycle"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Batch</button>}
      />

      <Table
        columns={[
          { key: 'code', header: 'Batch Code' },
          { key: 'cropType', header: 'Crop Type' },
          { key: 'greenhouse', header: 'Greenhouse', render: (r) => ghName(r.greenhouseId) },
          { key: 'plantingDate', header: 'Planted' },
          { key: 'harvestDate', header: 'Harvest' },
          { key: 'quantity', header: 'Qty' },
          { key: 'stage', header: 'Stage', render: (r) => <Badge>{r.stage}</Badge> },
          { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
        ]}
        rows={cropBatches}
      />

      {open && (
        <FormModal
          title="Add Crop Batch"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addCropBatch({
            code: v.code, cropType: v.cropType, greenhouseId: Number(v.greenhouseId),
            plantingDate: v.plantingDate, harvestDate: v.harvestDate,
            quantity: Number(v.quantity) || 0, stage: v.stage, status: 'Active',
          })}
          fields={[
            { name: 'code', label: 'Batch Code', required: true, default: 'BATCH-' },
            { name: 'cropType', label: 'Crop Type', required: true },
            { name: 'greenhouseId', label: 'Greenhouse', type: 'select', required: true,
              options: greenhouses.map((g) => ({ value: g.id, label: g.name })) },
            { name: 'plantingDate', label: 'Planting Date', type: 'date', required: true },
            { name: 'harvestDate', label: 'Expected Harvest Date', type: 'date' },
            { name: 'quantity', label: 'Quantity (plants)', type: 'number' },
            { name: 'stage', label: 'Stage', type: 'select', default: 'Germination',
              options: cropStages.map((s) => ({ value: s, label: s })) },
          ]}
        />
      )}
    </div>
  )
}

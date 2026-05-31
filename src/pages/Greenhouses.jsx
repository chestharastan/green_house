import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function Greenhouses() {
  const { greenhouses, addGreenhouse } = useData()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Greenhouses"
        subtitle="Manage greenhouse facilities"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Greenhouse</button>}
      />

      <Table
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'location', header: 'Location' },
          { key: 'type', header: 'Type' },
          { key: 'areaSize', header: 'Area (m²)' },
          { key: 'numberOfBeds', header: 'Beds' },
          { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
        ]}
        rows={greenhouses}
      />

      {open && (
        <FormModal
          title="Add Greenhouse"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addGreenhouse({
            name: v.name, location: v.location, type: v.type,
            areaSize: Number(v.areaSize) || 0, numberOfBeds: Number(v.numberOfBeds) || 0,
            status: v.status,
          })}
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'location', label: 'Location', required: true },
            { name: 'type', label: 'Type', type: 'select', required: true, default: 'Hydroponic',
              options: [{ value: 'Hydroponic', label: 'Hydroponic' }, { value: 'Soil-based', label: 'Soil-based' }] },
            { name: 'areaSize', label: 'Area Size (m²)', type: 'number' },
            { name: 'numberOfBeds', label: 'Number of Beds', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', default: 'Active',
              options: [{ value: 'Active', label: 'Active' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Inactive', label: 'Inactive' }] },
          ]}
        />
      )}
    </div>
  )
}

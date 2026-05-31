import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function Workers() {
  const { workers, addWorker } = useData()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Workers"
        subtitle="Worker profiles"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Worker</button>}
      />

      <Table
        columns={[
          { key: 'fullName', header: 'Name' },
          { key: 'phone', header: 'Phone' },
          { key: 'position', header: 'Position' },
          { key: 'hourlyRate', header: 'Rate/hr', render: (r) => `$${r.hourlyRate.toFixed(2)}` },
          { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
        ]}
        rows={workers}
      />

      {open && (
        <FormModal
          title="Add Worker"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addWorker({
            fullName: v.fullName, phone: v.phone, position: v.position,
            hourlyRate: Number(v.hourlyRate) || 0, status: v.status, userId: null,
          })}
          fields={[
            { name: 'fullName', label: 'Full Name', required: true },
            { name: 'phone', label: 'Phone' },
            { name: 'position', label: 'Position', type: 'select', default: 'Laborer',
              options: ['Laborer', 'Technician', 'Harvester', 'Supervisor'].map((p) => ({ value: p, label: p })) },
            { name: 'hourlyRate', label: 'Hourly Rate ($)', type: 'number', default: '2.5' },
            { name: 'status', label: 'Status', type: 'select', default: 'Active',
              options: ['Active', 'On Leave', 'Inactive'].map((s) => ({ value: s, label: s })) },
          ]}
        />
      )}
    </div>
  )
}

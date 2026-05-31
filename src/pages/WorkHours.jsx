import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, FormModal } from '../components/ui'

export default function WorkHours() {
  const { workHours, workers, addWorkHour } = useData()
  const [open, setOpen] = useState(false)
  const worker = (id) => workers.find((w) => w.id === id)
  const workerName = (id) => worker(id)?.fullName ?? '—'

  const rows = [...workHours].sort((a, b) => b.date.localeCompare(a.date))
  const totalHours = workHours.reduce((s, w) => s + Number(w.hours), 0)

  return (
    <div>
      <PageHeader
        title="Work Hour Tracking"
        subtitle={`Logged hours — total ${totalHours} h`}
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Hours</button>}
      />

      <Table
        columns={[
          { key: 'worker', header: 'Worker', render: (r) => workerName(r.workerId) },
          { key: 'date', header: 'Date' },
          { key: 'taskType', header: 'Task' },
          { key: 'hours', header: 'Hours' },
          { key: 'pay', header: 'Est. Pay',
            render: (r) => `$${((worker(r.workerId)?.hourlyRate || 0) * r.hours).toFixed(2)}` },
        ]}
        rows={rows}
      />

      {open && (
        <FormModal
          title="Log Work Hours"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addWorkHour({
            workerId: Number(v.workerId), date: v.date,
            hours: Number(v.hours) || 0, taskType: v.taskType,
          })}
          fields={[
            { name: 'workerId', label: 'Worker', type: 'select', required: true,
              options: workers.map((w) => ({ value: w.id, label: w.fullName })) },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'hours', label: 'Hours', type: 'number', required: true, default: '8' },
            { name: 'taskType', label: 'Task', type: 'select', default: 'Watering',
              options: ['Planting', 'Watering', 'Harvesting', 'Maintenance', 'Disinfection', 'Monitoring'].map((t) => ({ value: t, label: t })) },
          ]}
        />
      )}
    </div>
  )
}

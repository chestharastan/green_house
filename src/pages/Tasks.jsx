import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function Tasks() {
  const { workerTasks, workers, greenhouses, addWorkerTask } = useData()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const isManager = user.role === 'Admin' || user.role === 'Farm Manager'

  const workerName = (id) => workers.find((w) => w.id === id)?.fullName ?? '—'
  const ghName = (id) => greenhouses.find((g) => g.id === id)?.name ?? '—'

  // Workers only see tasks assigned to their own worker profile.
  let rows = workerTasks
  if (!isManager) {
    const me = workers.find((w) => w.userId === user.id)
    rows = workerTasks.filter((t) => me && t.workerId === me.id)
  }

  return (
    <div>
      <PageHeader
        title={isManager ? 'Worker Tasks' : 'My Tasks'}
        subtitle={isManager ? 'Assign and track tasks' : 'Tasks assigned to you'}
        action={isManager &&
          <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Assign Task</button>}
      />

      <Table
        empty="No tasks."
        columns={[
          { key: 'worker', header: 'Worker', render: (r) => workerName(r.workerId) },
          { key: 'greenhouse', header: 'Greenhouse', render: (r) => ghName(r.greenhouseId) },
          { key: 'taskType', header: 'Type' },
          { key: 'description', header: 'Description' },
          { key: 'dueDate', header: 'Due' },
          { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
        ]}
        rows={rows}
      />

      {open && (
        <FormModal
          title="Assign Task"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addWorkerTask({
            workerId: Number(v.workerId), greenhouseId: Number(v.greenhouseId),
            taskType: v.taskType, description: v.description, dueDate: v.dueDate, status: 'Pending',
          })}
          fields={[
            { name: 'workerId', label: 'Worker', type: 'select', required: true,
              options: workers.map((w) => ({ value: w.id, label: w.fullName })) },
            { name: 'greenhouseId', label: 'Greenhouse', type: 'select', required: true,
              options: greenhouses.map((g) => ({ value: g.id, label: g.name })) },
            { name: 'taskType', label: 'Task Type', type: 'select', default: 'Watering',
              options: ['Planting', 'Watering', 'Harvesting', 'Maintenance', 'Disinfection', 'Monitoring'].map((t) => ({ value: t, label: t })) },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
          ]}
        />
      )}
    </div>
  )
}

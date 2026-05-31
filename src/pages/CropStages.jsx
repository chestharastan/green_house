import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function CropStages() {
  const { cropStageLogs, cropBatches, cropStages, addCropStageLog } = useData()
  const [open, setOpen] = useState(false)
  const batchCode = (id) => cropBatches.find((b) => b.id === id)?.code ?? '—'

  const rows = [...cropStageLogs].sort((a, b) => b.logDate.localeCompare(a.logDate))

  return (
    <div>
      <PageHeader
        title="Crop Stage Tracking"
        subtitle="Log germination → transplanting → growing → harvest. Adding a log advances the batch's current stage."
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Log Stage</button>}
      />

      <div className="stage-flow">
        {cropStages.map((s, i) => (
          <span key={s} className="stage-pill">
            {s}{i < cropStages.length - 1 && <span className="stage-arrow">→</span>}
          </span>
        ))}
      </div>

      <Table
        columns={[
          { key: 'batch', header: 'Batch', render: (r) => batchCode(r.batchId) },
          { key: 'stage', header: 'Stage', render: (r) => <Badge>{r.stage}</Badge> },
          { key: 'logDate', header: 'Date' },
          { key: 'note', header: 'Note' },
        ]}
        rows={rows}
      />

      {open && (
        <FormModal
          title="Log Crop Stage"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addCropStageLog({
            batchId: Number(v.batchId), stage: v.stage, logDate: v.logDate, note: v.note,
          })}
          fields={[
            { name: 'batchId', label: 'Crop Batch', type: 'select', required: true,
              options: cropBatches.map((b) => ({ value: b.id, label: `${b.code} — ${b.cropType}` })) },
            { name: 'stage', label: 'Stage', type: 'select', required: true,
              options: cropStages.map((s) => ({ value: s, label: s })) },
            { name: 'logDate', label: 'Date', type: 'date', required: true },
            { name: 'note', label: 'Note', type: 'textarea' },
          ]}
        />
      )}
    </div>
  )
}

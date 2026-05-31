import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, FormModal } from '../components/ui'

// Suggested unit per sensor type, used to prefill the form.
const UNIT_BY_TYPE = {
  'Air Temperature': '°C', 'Air Humidity': '%', 'pH Level': 'pH', 'EC Level': 'mS/cm',
  'Water Temperature': '°C', 'Water Level': '%', 'CO₂ Level': 'ppm',
  'Light Intensity': 'lux', 'Flow Rate': 'L/min',
}

export default function Sensors() {
  const { sensorRecords, greenhouses, sensorTypes, addSensorRecord } = useData()
  const [open, setOpen] = useState(false)
  const ghName = (id) => greenhouses.find((g) => g.id === id)?.name ?? '—'

  const rows = [...sensorRecords].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))

  return (
    <div>
      <PageHeader
        title="Sensor Data (Manual Entry)"
        subtitle="Record environmental and nutrient readings"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Reading</button>}
      />

      <Table
        columns={[
          { key: 'recordedAt', header: 'Recorded At' },
          { key: 'greenhouse', header: 'Greenhouse', render: (r) => ghName(r.greenhouseId) },
          { key: 'type', header: 'Type' },
          { key: 'value', header: 'Reading', render: (r) => `${r.value} ${r.unit}` },
        ]}
        rows={rows}
      />

      {open && (
        <FormModal
          title="Add Sensor Reading"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addSensorRecord({
            greenhouseId: Number(v.greenhouseId), type: v.type,
            value: Number(v.value), unit: v.unit || UNIT_BY_TYPE[v.type] || '',
            recordedAt: v.recordedAt.replace('T', ' '),
          })}
          fields={[
            { name: 'greenhouseId', label: 'Greenhouse', type: 'select', required: true,
              options: greenhouses.map((g) => ({ value: g.id, label: g.name })) },
            { name: 'type', label: 'Sensor Type', type: 'select', required: true,
              options: sensorTypes.map((t) => ({ value: t, label: t })) },
            { name: 'value', label: 'Reading', type: 'number', required: true },
            { name: 'unit', label: 'Unit (auto if blank)' },
            { name: 'recordedAt', label: 'Recorded At', type: 'datetime-local', required: true },
          ]}
        />
      )}
    </div>
  )
}

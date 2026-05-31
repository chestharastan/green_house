import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function InventoryTransactions() {
  const { inventoryTransactions, inventoryItems, addInventoryTransaction } = useData()
  const [open, setOpen] = useState(false)
  const itemName = (id) => inventoryItems.find((i) => i.id === id)?.name ?? '—'
  const itemUnit = (id) => inventoryItems.find((i) => i.id === id)?.unit ?? ''

  const rows = [...inventoryTransactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader
        title="Stock In / Stock Out"
        subtitle="Recording a transaction automatically adjusts the item's stock level."
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ New Transaction</button>}
      />

      <Table
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'item', header: 'Item', render: (r) => itemName(Number(r.itemId)) },
          { key: 'type', header: 'Type', render: (r) => <Badge>{r.type}</Badge> },
          { key: 'quantity', header: 'Qty', render: (r) => `${r.quantity} ${itemUnit(Number(r.itemId))}` },
          { key: 'note', header: 'Note' },
        ]}
        rows={rows}
      />

      {open && (
        <FormModal
          title="New Stock Transaction"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addInventoryTransaction({
            itemId: Number(v.itemId), type: v.type,
            quantity: Number(v.quantity) || 0, date: v.date, note: v.note,
          })}
          fields={[
            { name: 'itemId', label: 'Item', type: 'select', required: true,
              options: inventoryItems.map((i) => ({ value: i.id, label: `${i.name} (${i.quantity} ${i.unit})` })) },
            { name: 'type', label: 'Type', type: 'select', required: true, default: 'IN',
              options: [{ value: 'IN', label: 'Stock In' }, { value: 'OUT', label: 'Stock Out' }] },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'note', label: 'Note', type: 'textarea' },
          ]}
        />
      )}
    </div>
  )
}

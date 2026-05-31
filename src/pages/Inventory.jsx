import { useState } from 'react'
import { useData } from '../context/DataContext'
import { PageHeader, Table, Badge, FormModal } from '../components/ui'

export default function Inventory() {
  const { inventoryItems, addInventoryItem } = useData()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Farm inputs and consumables"
        action={<button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Item</button>}
      />

      <Table
        columns={[
          { key: 'name', header: 'Item' },
          { key: 'category', header: 'Category' },
          { key: 'quantity', header: 'In Stock', render: (r) => `${r.quantity} ${r.unit}` },
          { key: 'reorderLevel', header: 'Reorder ≤' },
          { key: 'costPerUnit', header: 'Cost/Unit', render: (r) => `$${r.costPerUnit.toFixed(2)}` },
          { key: 'status', header: 'Status',
            render: (r) => <Badge>{r.quantity <= r.reorderLevel ? 'Pending' : 'Active'}</Badge> },
        ]}
        rows={inventoryItems}
      />

      {open && (
        <FormModal
          title="Add Inventory Item"
          onClose={() => setOpen(false)}
          onSubmit={(v) => addInventoryItem({
            name: v.name, category: v.category, unit: v.unit,
            quantity: Number(v.quantity) || 0, reorderLevel: Number(v.reorderLevel) || 0,
            costPerUnit: Number(v.costPerUnit) || 0,
          })}
          fields={[
            { name: 'name', label: 'Item Name', required: true },
            { name: 'category', label: 'Category', type: 'select', default: 'Nutrients',
              options: ['Seeds', 'Nutrients', 'pH Solution', 'Growing Media', 'Disinfection', 'Pesticides', 'Equipment'].map((c) => ({ value: c, label: c })) },
            { name: 'unit', label: 'Unit', type: 'select', default: 'L',
              options: ['L', 'kg', 'pack', 'box', 'unit'].map((u) => ({ value: u, label: u })) },
            { name: 'quantity', label: 'Initial Quantity', type: 'number', default: '0' },
            { name: 'reorderLevel', label: 'Reorder Level', type: 'number', default: '10' },
            { name: 'costPerUnit', label: 'Cost per Unit ($)', type: 'number', default: '0' },
          ]}
        />
      )}
    </div>
  )
}

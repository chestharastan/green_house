"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { mockInventory, mockUsageRecords, mockUsers } from "@/lib/mock-data"
import type { InventoryItem, UsageRecord } from "@/types/inventory"
import { Plus, Pencil, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

const PAGE_SIZE = 5

const CATEGORIES = ["Seeds", "Nutrients", "GrowingMedia", "Equipment", "Chemicals", "Packaging"]
type Tab = "items" | "usage"

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("items")
  const [items, setItems] = useState(mockInventory)
  const [usage, setUsage] = useState(mockUsageRecords)
  const [itemsPage, setItemsPage] = useState(1)
  const [usagePage, setUsagePage] = useState(1)

  const [iOpen, setIOpen] = useState(false)
  const [iEdit, setIEdit] = useState<InventoryItem | null>(null)
  const [iForm, setIForm] = useState({ name: "", category: "Seeds" as InventoryItem["category"], unit: "", currentStock: "", minimumStock: "", unitCost: "", supplier: "" })

  const [uOpen, setUOpen] = useState(false)
  const [uForm, setUForm] = useState({ itemId: "", action: "Consumed" as UsageRecord["action"], quantity: "", performedBy: "", notes: "" })

  function saveItem() {
    if (!iForm.name || !iForm.unit) return
    if (iEdit) {
      setItems(items.map(i => i.id === iEdit.id ? {
        ...i, ...iForm, currentStock: Number(iForm.currentStock),
        minimumStock: Number(iForm.minimumStock), unitCost: Number(iForm.unitCost),
      } : i))
    } else {
      setItems([...items, {
        id: `inv${Date.now()}`, ...iForm,
        currentStock: Number(iForm.currentStock), minimumStock: Number(iForm.minimumStock),
        unitCost: Number(iForm.unitCost), lastRestockedAt: new Date().toISOString().split("T")[0],
      }])
    }
    setIOpen(false)
  }

  function saveUsage() {
    if (!uForm.itemId || !uForm.quantity) return
    const qty = Number(uForm.quantity)
    const item = items.find(i => i.id === uForm.itemId)!
    const stockAfter = uForm.action === "Restocked" ? item.currentStock + qty : item.currentStock - qty
    const ur: UsageRecord = {
      id: `ur${Date.now()}`, ...uForm, quantity: qty,
      stockAfter, recordedAt: new Date().toISOString().split("T")[0],
    }
    setUsage([ur, ...usage])
    setItems(items.map(i => i.id === uForm.itemId ? { ...i, currentStock: stockAfter } : i))
    setUOpen(false)
  }

  const lowStock = items.filter(i => i.currentStock <= i.minimumStock)

  return (
    <div className="space-y-6">
      {lowStock.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800 text-sm">Low Stock: {lowStock.length} item(s)</p>
                <p className="text-sm text-yellow-700 mt-0.5">{lowStock.map(i => `${i.name} (${i.currentStock} ${i.unit})`).join(" · ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-0.5 bg-slate-100 p-1 rounded-xl w-fit">
        {([["items", "Inventory Items"], ["usage", "Usage Records"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "items" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Dialog open={uOpen} onOpenChange={setUOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setUForm({ itemId: "", action: "Consumed", quantity: "", performedBy: "", notes: "" })}>
                  <ArrowDown size={15} /> Record Usage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Stock Change</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Item</Label>
                    <Select value={uForm.itemId} onValueChange={v => setUForm({ ...uForm, itemId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                      <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Action</Label>
                    <Select value={uForm.action} onValueChange={v => setUForm({ ...uForm, action: v as UsageRecord["action"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Consumed", "Restocked", "Adjusted", "Wasted"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" step="0.1" placeholder="10" value={uForm.quantity} onChange={e => setUForm({ ...uForm, quantity: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Performed By</Label>
                    <Select value={uForm.performedBy} onValueChange={v => setUForm({ ...uForm, performedBy: v })}>
                      <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                      <SelectContent>{mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="..." value={uForm.notes} onChange={e => setUForm({ ...uForm, notes: e.target.value })} /></div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveUsage} className="flex-1">Save</Button><Button variant="outline" onClick={() => setUOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={iOpen} onOpenChange={setIOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setIEdit(null); setIForm({ name: "", category: "Seeds", unit: "", currentStock: "", minimumStock: "", unitCost: "", supplier: "" }) }}>
                  <Plus size={16} /> Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{iEdit ? "Edit Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label>Name</Label><Input placeholder="Lettuce Seeds" value={iForm.name} onChange={e => setIForm({ ...iForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select value={iForm.category} onValueChange={v => setIForm({ ...iForm, category: v as InventoryItem["category"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Unit</Label><Input placeholder="g / L / pcs" value={iForm.unit} onChange={e => setIForm({ ...iForm, unit: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Current Stock</Label><Input type="number" placeholder="500" value={iForm.currentStock} onChange={e => setIForm({ ...iForm, currentStock: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Min Stock</Label><Input type="number" placeholder="100" value={iForm.minimumStock} onChange={e => setIForm({ ...iForm, minimumStock: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Unit Cost ($)</Label><Input type="number" step="0.01" placeholder="0.05" value={iForm.unitCost} onChange={e => setIForm({ ...iForm, unitCost: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Supplier</Label><Input placeholder="SeedCo" value={iForm.supplier} onChange={e => setIForm({ ...iForm, supplier: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveItem} className="flex-1">Save</Button><Button variant="outline" onClick={() => setIOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.slice((itemsPage - 1) * PAGE_SIZE, itemsPage * PAGE_SIZE).map(item => {
                    const isLow = item.currentStock <= item.minimumStock
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                        <TableCell className={`font-semibold ${isLow ? "text-red-600" : "text-slate-800"}`}>{item.currentStock} {item.unit}</TableCell>
                        <TableCell className="text-slate-500">{item.minimumStock} {item.unit}</TableCell>
                        <TableCell className="text-slate-500">${item.unitCost}</TableCell>
                        <TableCell className="text-slate-500">{item.supplier}</TableCell>
                        <TableCell>
                          {isLow
                            ? <Badge variant="warning" className="gap-1"><AlertTriangle size={11} /> Low Stock</Badge>
                            : <Badge variant="default">OK</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setIEdit(item)
                            setIForm({ name: item.name, category: item.category, unit: item.unit, currentStock: String(item.currentStock), minimumStock: String(item.minimumStock), unitCost: String(item.unitCost), supplier: item.supplier ?? "" })
                            setIOpen(true)
                          }}>
                            <Pencil size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination page={itemsPage} totalPages={Math.ceil(items.length / PAGE_SIZE)} totalItems={items.length} pageSize={PAGE_SIZE} onChange={setItemsPage} />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "usage" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock After</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.slice((usagePage - 1) * PAGE_SIZE, usagePage * PAGE_SIZE).map(ur => {
                  const item = items.find(i => i.id === ur.itemId)
                  const user = mockUsers.find(u => u.id === ur.performedBy)
                  const isIn = ur.action === "Restocked"
                  return (
                    <TableRow key={ur.id}>
                      <TableCell className="text-slate-500">{ur.recordedAt}</TableCell>
                      <TableCell className="font-medium">{item?.name}</TableCell>
                      <TableCell>
                        <Badge variant={isIn ? "default" : ur.action === "Wasted" ? "destructive" : "secondary"} className="gap-1">
                          {isIn ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{ur.action}
                        </Badge>
                      </TableCell>
                      <TableCell className={isIn ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {isIn ? "+" : "-"}{ur.quantity} {item?.unit}
                      </TableCell>
                      <TableCell className="text-slate-500">{ur.stockAfter} {item?.unit}</TableCell>
                      <TableCell className="text-slate-500">{user?.name}</TableCell>
                      <TableCell className="text-slate-500 max-w-xs truncate">{ur.notes ?? "—"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination page={usagePage} totalPages={Math.ceil(usage.length / PAGE_SIZE)} totalItems={usage.length} pageSize={PAGE_SIZE} onChange={setUsagePage} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

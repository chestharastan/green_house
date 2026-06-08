"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { mockUtilityRecords, mockUsers, type UtilityRecord } from "@/lib/mock-data"
import { Plus, Droplets, Zap, FlaskConical, Hash } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const PAGE_SIZE = 5

export default function UtilitiesPage() {
  const [records, setRecords] = useState(mockUtilityRecords)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({ date: "", waterLiters: "", electricityKwh: "", nutrientLiters: "", recordedBy: "", notes: "" })

  function save() {
    if (!form.date || !form.recordedBy) return
    const rec: UtilityRecord = {
      id: `util${Date.now()}`, date: form.date,
      waterLiters: Number(form.waterLiters),
      electricityKwh: Number(form.electricityKwh),
      nutrientLiters: Number(form.nutrientLiters),
      recordedBy: form.recordedBy,
      notes: form.notes || undefined,
    }
    setRecords([rec, ...records])
    setPage(1)
    setOpen(false)
  }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const chartSorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const totalWater = records.reduce((s, r) => s + r.waterLiters, 0)
  const totalElec = records.reduce((s, r) => s + r.electricityKwh, 0)
  const totalNutrient = records.reduce((s, r) => s + r.nutrientLiters, 0)
  const avgWater = Math.round(totalWater / records.length)

  const chartData = {
    labels: chartSorted.map(r => r.date.slice(5)),
    datasets: [
      { label: "Water (L)", data: chartSorted.map(r => r.waterLiters), backgroundColor: "rgba(59,130,246,0.7)", borderRadius: 4 },
      { label: "Electricity (kWh×10)", data: chartSorted.map(r => r.electricityKwh * 10), backgroundColor: "rgba(234,179,8,0.7)", borderRadius: 4 },
      { label: "Nutrients (L×10)", data: chartSorted.map(r => r.nutrientLiters * 10), backgroundColor: "rgba(22,163,74,0.7)", borderRadius: 4 },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Droplets size={16} className="text-blue-600" />} iconBg="rgba(37,99,235,0.12)" label="Total Water" value={`${totalWater.toLocaleString()} L`} sub={`Avg ${avgWater} L/day`} />
        <StatCard icon={<Zap size={16} className="text-yellow-600" />} iconBg="rgba(234,179,8,0.14)" label="Total Electricity" value={`${totalElec.toFixed(1)} kWh`} sub={`Avg ${(totalElec / records.length).toFixed(1)} kWh/day`} />
        <StatCard icon={<FlaskConical size={16} className="text-green-600" />} iconBg="rgba(22,163,74,0.12)" label="Total Nutrients" value={`${totalNutrient.toFixed(1)} L`} sub={`Avg ${(totalNutrient / records.length).toFixed(1)} L/day`} />
        <StatCard icon={<Hash size={16} className="text-slate-500" />} iconBg="rgba(100,116,139,0.12)" label="Records" value={records.length} sub="days tracked" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle>7-Day Resource Usage</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 200 }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top", labels: { boxWidth: 12, padding: 16, font: { size: 11 } } }, tooltip: { mode: "index" } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                  y: { beginAtZero: true, ticks: { font: { size: 11 } } },
                },
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">Electricity and Nutrients ×10 for scale comparison with Water</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ date: "", waterLiters: "", electricityKwh: "", nutrientLiters: "", recordedBy: "", notes: "" })}>
              <Plus size={16} /> Record Daily Usage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Daily Utility Usage</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Recorded By</Label>
                <Select value={form.recordedBy} onValueChange={v => setForm({ ...form, recordedBy: v })}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>{mockUsers.filter(u => u.isActive).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Water Usage (L)</Label><Input type="number" placeholder="300" value={form.waterLiters} onChange={e => setForm({ ...form, waterLiters: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Electricity (kWh)</Label><Input type="number" step="0.1" placeholder="14.0" value={form.electricityKwh} onChange={e => setForm({ ...form, electricityKwh: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Nutrient Solution (L)</Label><Input type="number" step="0.1" placeholder="3.2" value={form.nutrientLiters} onChange={e => setForm({ ...form, nutrientLiters: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-2 pt-2"><Button onClick={save} className="flex-1">Save</Button><Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Water (L)</TableHead>
                <TableHead>Electricity (kWh)</TableHead>
                <TableHead>Nutrients (L)</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map(rec => {
                const user = mockUsers.find(u => u.id === rec.recordedBy)
                return (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.date}</TableCell>
                    <TableCell className="text-blue-700 font-semibold">{rec.waterLiters} L</TableCell>
                    <TableCell className="text-yellow-700 font-semibold">{rec.electricityKwh} kWh</TableCell>
                    <TableCell className="text-green-700 font-semibold">{rec.nutrientLiters} L</TableCell>
                    <TableCell className="text-slate-500">{user?.name}</TableCell>
                    <TableCell className="text-slate-500">{rec.notes ?? "—"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
            <p className="text-[12px] text-slate-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} records
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-3 rounded-[7px] text-[12px] font-medium text-slate-600 hover:bg-black/[0.05] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="h-7 w-7 rounded-[7px] text-[12px] font-medium transition-colors"
                  style={page === n ? {
                    background: "rgba(22,163,74,0.1)",
                    color: "#15803d",
                    border: "0.5px solid rgba(22,163,74,0.2)",
                  } : { color: "#64748b" }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 px-3 rounded-[7px] text-[12px] font-medium text-slate-600 hover:bg-black/[0.05] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

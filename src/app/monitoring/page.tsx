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
import { mockMonitoringRecords, mockWaterBeds, mockUsers } from "@/lib/mock-data"
import type { BedMonitoringRecord, ReadingStatus } from "@/types/monitoring"
import { Plus, AlertTriangle } from "lucide-react"
import { PH_RANGE, EC_RANGE, TEMP_RANGE } from "@/lib/constants"
import { Pagination } from "@/components/ui/pagination"

const PAGE_SIZE = 5

function statusBadge(status: ReadingStatus) {
  const variant = status === "Normal" ? "default" : status === "Warning" ? "warning" : "destructive"
  return <Badge variant={variant}>{status}</Badge>
}

function calcStatus(value: number, min: number, max: number): ReadingStatus {
  if (value < min - 0.5 || value > max + 0.5) return "Critical"
  if (value < min || value > max) return "Warning"
  return "Normal"
}

export default function MonitoringPage() {
  const [records, setRecords] = useState(mockMonitoringRecords)
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    bedId: "", recordedBy: "",
    pH: "", ec: "", waterTempC: "", waterLevelCm: "", notes: "",
  })

  function save() {
    if (!form.bedId || !form.recordedBy || !form.pH) return
    const pH = Number(form.pH)
    const ec = Number(form.ec)
    const temp = Number(form.waterTempC)
    const rec: BedMonitoringRecord = {
      id: `m${Date.now()}`,
      bedId: form.bedId,
      recordedBy: form.recordedBy,
      recordedAt: new Date().toISOString(),
      pH, ec, waterTempC: temp,
      waterLevelCm: Number(form.waterLevelCm),
      phStatus: calcStatus(pH, PH_RANGE.min, PH_RANGE.max),
      ecStatus: calcStatus(ec, EC_RANGE.min, EC_RANGE.max),
      tempStatus: calcStatus(temp, TEMP_RANGE.min, TEMP_RANGE.max),
      notes: form.notes || undefined,
    }
    setRecords([rec, ...records])
    setOpen(false)
  }

  const activeBeds = mockWaterBeds.filter(b => b.status === "Active")
  const criticals = records.filter(r => r.phStatus === "Critical" || r.ecStatus === "Critical" || r.tempStatus === "Critical")
  const warnings = records.filter(r =>
    (r.phStatus === "Warning" || r.ecStatus === "Warning" || r.tempStatus === "Warning") &&
    r.phStatus !== "Critical" && r.ecStatus !== "Critical" && r.tempStatus !== "Critical"
  )

  // Latest reading per bed
  const latestByBed = activeBeds.map(bed => {
    const bedRecords = records.filter(r => r.bedId === bed.id).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    return { bed, latest: bedRecords[0] }
  })

  return (
    <div className="space-y-6">
      {/* Bed status overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {latestByBed.map(({ bed, latest }) => {
          const hasIssue = latest && (latest.phStatus !== "Normal" || latest.ecStatus !== "Normal" || latest.tempStatus !== "Normal")
          const isCritical = latest && (latest.phStatus === "Critical" || latest.ecStatus === "Critical" || latest.tempStatus === "Critical")
          return (
            <Card key={bed.id} className={isCritical ? "border-red-300" : hasIssue ? "border-yellow-300" : ""}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="font-semibold text-sm text-gray-900">{bed.bedCode}</p>
                {latest ? (
                  <>
                    <p className="text-xs text-gray-500 mt-1">pH {latest.pH} · EC {latest.ec}</p>
                    <p className="text-xs text-gray-500">{latest.waterTempC}°C</p>
                    <div className="mt-2">
                      {isCritical
                        ? <Badge variant="destructive" className="text-xs">Critical</Badge>
                        : hasIssue
                        ? <Badge variant="warning" className="text-xs">Warning</Badge>
                        : <Badge variant="default" className="text-xs">Normal</Badge>}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">No data</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts */}
      {(criticals.length > 0 || warnings.length > 0) && (
        <div className="grid gap-3">
          {criticals.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 text-sm">{criticals.length} Critical Reading(s)</p>
                    {criticals.map(r => {
                      const bed = mockWaterBeds.find(b => b.id === r.bedId)
                      return <p key={r.id} className="text-sm text-red-700">{bed?.bedCode} — pH: {r.pH} | EC: {r.ec} | Temp: {r.waterTempC}°C</p>
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            {records.length} records · Optimal ranges: pH {PH_RANGE.min}–{PH_RANGE.max} · EC {EC_RANGE.min}–{EC_RANGE.max} · Temp {TEMP_RANGE.min}–{TEMP_RANGE.max}°C
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm({ bedId: "", recordedBy: "", pH: "", ec: "", waterTempC: "", waterLevelCm: "", notes: "" })}>
              <Plus size={16} /> Record Reading
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Water Bed Monitoring</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Water Bed</Label>
                  <Select value={form.bedId} onValueChange={v => setForm({ ...form, bedId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select bed" /></SelectTrigger>
                    <SelectContent>{activeBeds.map(b => <SelectItem key={b.id} value={b.id}>{b.bedCode}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Recorded By</Label>
                  <Select value={form.recordedBy} onValueChange={v => setForm({ ...form, recordedBy: v })}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>{mockUsers.filter(u => u.isActive).map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>pH <span className="text-gray-400 font-normal">({PH_RANGE.min}–{PH_RANGE.max})</span></Label>
                  <Input type="number" step="0.1" placeholder="6.0" value={form.pH} onChange={e => setForm({ ...form, pH: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>EC (mS/cm) <span className="text-gray-400 font-normal">({EC_RANGE.min}–{EC_RANGE.max})</span></Label>
                  <Input type="number" step="0.1" placeholder="1.8" value={form.ec} onChange={e => setForm({ ...form, ec: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Water Temp (°C) <span className="text-gray-400 font-normal">({TEMP_RANGE.min}–{TEMP_RANGE.max})</span></Label>
                  <Input type="number" step="0.1" placeholder="22" value={form.waterTempC} onChange={e => setForm({ ...form, waterTempC: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Water Level (cm)</Label>
                  <Input type="number" placeholder="12" value={form.waterLevelCm} onChange={e => setForm({ ...form, waterLevelCm: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="Any observations..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Bed</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>EC</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>Level (cm)</TableHead>
                <TableHead>pH Status</TableHead>
                <TableHead>EC Status</TableHead>
                <TableHead>Temp Status</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(rec => {
                const bed = mockWaterBeds.find(b => b.id === rec.bedId)
                const user = mockUsers.find(u => u.id === rec.recordedBy)
                return (
                  <TableRow key={rec.id}>
                    <TableCell className="text-gray-500 text-xs">{rec.recordedAt.replace("T", " ").slice(0, 16)}</TableCell>
                    <TableCell className="font-medium">{bed?.bedCode}</TableCell>
                    <TableCell className="font-semibold">{rec.pH}</TableCell>
                    <TableCell className="font-semibold">{rec.ec}</TableCell>
                    <TableCell className="font-semibold">{rec.waterTempC}</TableCell>
                    <TableCell className="text-gray-500">{rec.waterLevelCm}</TableCell>
                    <TableCell>{statusBadge(rec.phStatus)}</TableCell>
                    <TableCell>{statusBadge(rec.ecStatus)}</TableCell>
                    <TableCell>{statusBadge(rec.tempStatus)}</TableCell>
                    <TableCell className="text-gray-500">{user?.name}</TableCell>
                    <TableCell className="text-gray-500 max-w-[150px] truncate">{rec.notes ?? "—"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={Math.ceil(records.length / PAGE_SIZE)} totalItems={records.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </CardContent>
      </Card>
    </div>
  )
}

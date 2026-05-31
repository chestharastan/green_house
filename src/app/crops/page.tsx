"use client"
import { Fragment, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { mockCropTypes, mockCropBatches, mockHarvestRecords, mockWaterBeds, mockUsers } from "@/lib/mock-data"
import type { CropType, CropBatch, HarvestRecord } from "@/types/crop"
import { Plus, Pencil, ArrowRight, Leaf, ChevronDown, ChevronRight } from "lucide-react"
import { CROP_STAGES } from "@/lib/constants"
import { Pagination } from "@/components/ui/pagination"

const PAGE_SIZE = 5

type Tab = "types" | "batches" | "harvest"

const stageVariant: Record<string, string> = {
  Seed: "secondary", Germination: "info", Transplanting: "warning",
  Growing: "default", Harvest: "destructive", Completed: "outline",
}

const stageDotColor: Record<string, string> = {
  Seed: "bg-slate-400",
  Germination: "bg-blue-400",
  Transplanting: "bg-amber-400",
  Growing: "bg-green-500",
  Harvest: "bg-red-400",
  Completed: "bg-slate-300",
}

function StagePipeline({ currentStage }: { currentStage: string }) {
  const stages = Array.from(CROP_STAGES)
  const currentIdx = stages.indexOf(currentStage)
  return (
    <div className="flex items-center gap-0.5">
      {stages.map((stage, i) => {
        const isCurrent = i === currentIdx
        const isDone = i < currentIdx
        return (
          <div key={stage} className="flex items-center">
            <div
              className={`rounded-full transition-all ${
                isCurrent
                  ? `${stageDotColor[stage]} w-2.5 h-2.5 ring-2 ring-offset-1 ring-slate-300`
                  : isDone
                  ? `${stageDotColor[stage]} w-2 h-2 opacity-60`
                  : "bg-slate-200 w-2 h-2"
              }`}
              title={stage}
            />
            {i < stages.length - 1 && (
              <div className={`w-3 h-px ${isDone ? "bg-slate-300" : "bg-slate-200"}`} />
            )}
          </div>
        )
      })}
      <span className="ml-1.5 text-xs text-slate-600 font-medium">{currentStage}</span>
    </div>
  )
}

export default function CropsPage() {
  const [tab, setTab] = useState<Tab>("types")
  const [cropTypes, setCropTypes] = useState(mockCropTypes)
  const [batches, setBatches] = useState(mockCropBatches)
  const [harvests, setHarvests] = useState(mockHarvestRecords)
  const [stageFilter, setStageFilter] = useState<string | null>(null)
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null)
  const [batchPage, setBatchPage] = useState(1)
  const [harvestPage, setHarvestPage] = useState(1)

  // Crop type dialog
  const [ctOpen, setCtOpen] = useState(false)
  const [ctEdit, setCtEdit] = useState<CropType | null>(null)
  const [ctForm, setCtForm] = useState({ name: "", category: "Leafy" as CropType["category"], averageDaysToHarvest: "", notes: "" })

  // Batch dialog
  const [bOpen, setBOpen] = useState(false)
  const [bEdit, setBEdit] = useState<CropBatch | null>(null)
  const [bForm, setBForm] = useState({ batchCode: "", cropTypeId: "", bedId: "", seedlingCount: "", estimatedHarvestDate: "", notes: "" })

  // Stage update dialog
  const [stageOpen, setStageOpen] = useState(false)
  const [stageBatch, setStageBatch] = useState<CropBatch | null>(null)
  const [newStage, setNewStage] = useState<CropBatch["currentStage"]>("Seed")

  // Harvest dialog
  const [hOpen, setHOpen] = useState(false)
  const [hForm, setHForm] = useState({ batchId: "", yieldKg: "", qualityRating: "4", harvestedBy: "", notes: "" })

  function saveCropType() {
    if (!ctForm.name) return
    if (ctEdit) {
      setCropTypes(cropTypes.map(c => c.id === ctEdit.id ? { ...c, ...ctForm, averageDaysToHarvest: Number(ctForm.averageDaysToHarvest) } : c))
    } else {
      setCropTypes([...cropTypes, { id: `ct${Date.now()}`, ...ctForm, averageDaysToHarvest: Number(ctForm.averageDaysToHarvest) }])
    }
    setCtOpen(false)
  }

  function saveBatch() {
    if (!bForm.batchCode || !bForm.cropTypeId || !bForm.bedId) return
    const today = new Date().toISOString().split("T")[0]
    if (bEdit) {
      setBatches(batches.map(b => b.id === bEdit.id ? { ...b, ...bForm, seedlingCount: Number(bForm.seedlingCount) } : b))
    } else {
      const nb: CropBatch = {
        id: `batch${Date.now()}`, ...bForm, seedlingCount: Number(bForm.seedlingCount),
        currentStage: "Seed", managerId: "u2", startedAt: today,
        stageHistory: [{ stage: "Seed", startedAt: today }],
      }
      setBatches([...batches, nb])
    }
    setBOpen(false)
  }

  function updateStage() {
    if (!stageBatch) return
    const today = new Date().toISOString().split("T")[0]
    setBatches(batches.map(b => b.id === stageBatch.id ? {
      ...b, currentStage: newStage,
      stageHistory: [...b.stageHistory.map((s, i, arr) =>
        i === arr.length - 1 ? { ...s, completedAt: today } : s
      ), { stage: newStage, startedAt: today }],
    } : b))
    setStageOpen(false)
  }

  function saveHarvest() {
    if (!hForm.batchId || !hForm.yieldKg) return
    const today = new Date().toISOString().split("T")[0]
    const hr: HarvestRecord = {
      id: `hr${Date.now()}`, ...hForm,
      harvestedAt: today, yieldKg: Number(hForm.yieldKg), qualityRating: Number(hForm.qualityRating) as 1 | 2 | 3 | 4 | 5,
    }
    setHarvests([...harvests, hr])
    setHOpen(false)
  }

  const activeBeds = mockWaterBeds.filter(b => b.status !== "Maintenance")

  // Stats bar
  const today = new Date()
  const in7Days = new Date(today)
  in7Days.setDate(today.getDate() + 7)
  const activeBatchCount = batches.filter(b => b.currentStage !== "Completed").length
  const totalSeedlings = batches
    .filter(b => b.currentStage !== "Completed")
    .reduce((s, b) => s + b.seedlingCount, 0)
  const upcomingHarvests = batches.filter(b => {
    if (b.currentStage === "Completed" || !b.estimatedHarvestDate) return false
    const d = new Date(b.estimatedHarvestDate)
    return d >= today && d <= in7Days
  }).length

  const filteredBatches = stageFilter ? batches.filter(b => b.currentStage === stageFilter) : batches

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 bg-green-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-green-700">{activeBatchCount}</p>
            <p className="text-xs text-green-600 mt-0.5">Active Batches</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-blue-700">{totalSeedlings.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-0.5">Total Seedlings</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-amber-700">{upcomingHarvests}</p>
            <p className="text-xs text-amber-600 mt-0.5">Harvests in 7 Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 bg-slate-100 p-1 rounded-xl w-fit">
        {([["types", "Crop Types"], ["batches", "Batches"], ["harvest", "Harvest Records"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Crop Types ── */}
      {tab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={ctOpen} onOpenChange={setCtOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCtEdit(null); setCtForm({ name: "", category: "Leafy", averageDaysToHarvest: "", notes: "" }) }}>
                  <Plus size={16} /> Add Crop Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{ctEdit ? "Edit Crop Type" : "Add Crop Type"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label>Name</Label><Input placeholder="Lettuce" value={ctForm.name} onChange={e => setCtForm({ ...ctForm, name: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={ctForm.category} onValueChange={v => setCtForm({ ...ctForm, category: v as CropType["category"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Leafy", "Herb", "Fruiting", "Root"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Avg Days to Harvest</Label><Input type="number" placeholder="35" value={ctForm.averageDaysToHarvest} onChange={e => setCtForm({ ...ctForm, averageDaysToHarvest: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="..." value={ctForm.notes} onChange={e => setCtForm({ ...ctForm, notes: e.target.value })} /></div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveCropType} className="flex-1">Save</Button><Button variant="outline" onClick={() => setCtOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropTypes.map(ct => (
              <Card key={ct.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 p-2 rounded-lg"><Leaf size={18} className="text-green-600" /></div>
                      <div>
                        <p className="font-semibold text-slate-800">{ct.name}</p>
                        <Badge variant="secondary" className="mt-0.5">{ct.category}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setCtEdit(ct); setCtForm({ name: ct.name, category: ct.category, averageDaysToHarvest: String(ct.averageDaysToHarvest), notes: ct.notes ?? "" }); setCtOpen(true) }}>
                      <Pencil size={14} />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">Avg harvest: <span className="font-medium text-slate-700">{ct.averageDaysToHarvest} days</span></p>
                  {ct.notes && <p className="text-xs text-slate-400 mt-1">{ct.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Batches ── */}
      {tab === "batches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Stage filter chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStageFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${!stageFilter ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >All</button>
              {Array.from(CROP_STAGES).map(stage => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stageFilter === stage ? null : stage)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${stageFilter === stage ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >{stage}</button>
              ))}
            </div>
            <Dialog open={bOpen} onOpenChange={setBOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setBEdit(null); setBForm({ batchCode: "", cropTypeId: "", bedId: "", seedlingCount: "", estimatedHarvestDate: "", notes: "" }) }}>
                  <Plus size={16} /> New Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{bEdit ? "Edit Batch" : "Create Crop Batch"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label>Batch Code</Label><Input placeholder="LT-2024-003" value={bForm.batchCode} onChange={e => setBForm({ ...bForm, batchCode: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Crop Type</Label>
                    <Select value={bForm.cropTypeId} onValueChange={v => setBForm({ ...bForm, cropTypeId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                      <SelectContent>{cropTypes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Water Bed</Label>
                    <Select value={bForm.bedId} onValueChange={v => setBForm({ ...bForm, bedId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select bed" /></SelectTrigger>
                      <SelectContent>{activeBeds.map(b => <SelectItem key={b.id} value={b.id}>{b.bedCode}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Seedling Count</Label><Input type="number" placeholder="120" value={bForm.seedlingCount} onChange={e => setBForm({ ...bForm, seedlingCount: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Estimated Harvest Date</Label><Input type="date" value={bForm.estimatedHarvestDate} onChange={e => setBForm({ ...bForm, estimatedHarvestDate: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="..." value={bForm.notes} onChange={e => setBForm({ ...bForm, notes: e.target.value })} /></div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveBatch} className="flex-1">Save</Button><Button variant="outline" onClick={() => setBOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stage Update Dialog */}
          <Dialog open={stageOpen} onOpenChange={setStageOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Update Stage — {stageBatch?.batchCode}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>New Stage</Label>
                  <Select value={newStage} onValueChange={v => setNewStage(v as CropBatch["currentStage"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CROP_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2"><Button onClick={updateStage} className="flex-1">Update</Button><Button variant="outline" onClick={() => setStageOpen(false)} className="flex-1">Cancel</Button></div>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Batch Code</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Plants</TableHead>
                    <TableHead>Stage Progress</TableHead>
                    <TableHead>Est. Harvest</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.slice((batchPage - 1) * PAGE_SIZE, batchPage * PAGE_SIZE).map(batch => {
                    const crop = cropTypes.find(c => c.id === batch.cropTypeId)
                    const bed = mockWaterBeds.find(b => b.id === batch.bedId)
                    const isExpanded = expandedBatch === batch.id
                    return (
                      <Fragment key={batch.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => setExpandedBatch(isExpanded ? null : batch.id)}
                        >
                          <TableCell className="pl-3">
                            {isExpanded
                              ? <ChevronDown size={14} className="text-slate-400" />
                              : <ChevronRight size={14} className="text-slate-400" />}
                          </TableCell>
                          <TableCell className="font-medium">{batch.batchCode}</TableCell>
                          <TableCell>{crop?.name}</TableCell>
                          <TableCell>{bed?.bedCode}</TableCell>
                          <TableCell>{batch.seedlingCount}</TableCell>
                          <TableCell><StagePipeline currentStage={batch.currentStage} /></TableCell>
                          <TableCell className="text-slate-500">{batch.estimatedHarvestDate}</TableCell>
                          <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => { setStageBatch(batch); setNewStage(batch.currentStage); setStageOpen(true) }}>
                              <ArrowRight size={13} /> Stage
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expandable stage history */}
                        {isExpanded && (
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableCell colSpan={8} className="py-3 px-6">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Stage History</p>
                              <div className="flex flex-wrap gap-2">
                                {batch.stageHistory.map((entry, i) => (
                                  <div key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                                    <Badge variant={stageVariant[entry.stage]}>{entry.stage}</Badge>
                                    <span className="text-xs text-slate-500">{entry.startedAt}</span>
                                    {entry.completedAt
                                      ? <span className="text-xs text-slate-400">→ {entry.completedAt}</span>
                                      : <span className="text-xs text-green-600 font-medium">· ongoing</span>}
                                  </div>
                                ))}
                              </div>
                              {batch.notes && <p className="text-xs text-slate-400 mt-2">Note: {batch.notes}</p>}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination page={batchPage} totalPages={Math.ceil(filteredBatches.length / PAGE_SIZE)} totalItems={filteredBatches.length} pageSize={PAGE_SIZE} onChange={setBatchPage} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Harvest Records ── */}
      {tab === "harvest" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={hOpen} onOpenChange={setHOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setHForm({ batchId: "", yieldKg: "", qualityRating: "4", harvestedBy: "", notes: "" })}>
                  <Plus size={16} /> Record Harvest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Harvest</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Batch</Label>
                    <Select value={hForm.batchId} onValueChange={v => setHForm({ ...hForm, batchId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>{batches.map(b => <SelectItem key={b.id} value={b.id}>{b.batchCode}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Yield (kg)</Label><Input type="number" step="0.1" placeholder="25.0" value={hForm.yieldKg} onChange={e => setHForm({ ...hForm, yieldKg: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Quality (1–5)</Label>
                    <Select value={hForm.qualityRating} onValueChange={v => setHForm({ ...hForm, qualityRating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{"★".repeat(n)} ({n})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Harvested By</Label>
                    <Select value={hForm.harvestedBy} onValueChange={v => setHForm({ ...hForm, harvestedBy: v })}>
                      <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                      <SelectContent>{mockUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="..." value={hForm.notes} onChange={e => setHForm({ ...hForm, notes: e.target.value })} /></div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveHarvest} className="flex-1">Save</Button><Button variant="outline" onClick={() => setHOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Yield (kg)</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Harvested By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {harvests.slice((harvestPage - 1) * PAGE_SIZE, harvestPage * PAGE_SIZE).map(hr => {
                    const batch = batches.find(b => b.id === hr.batchId)
                    const bed = batch ? mockWaterBeds.find(b => b.id === batch.bedId) : null
                    const worker = mockUsers.find(u => u.id === hr.harvestedBy)
                    return (
                      <TableRow key={hr.id}>
                        <TableCell className="font-medium">{batch?.batchCode}</TableCell>
                        <TableCell className="text-slate-500">{bed?.bedCode ?? "—"}</TableCell>
                        <TableCell className="text-slate-500">{hr.harvestedAt}</TableCell>
                        <TableCell className="font-semibold text-green-700">{hr.yieldKg} kg</TableCell>
                        <TableCell className="text-yellow-500">{"★".repeat(hr.qualityRating)}{"☆".repeat(5 - hr.qualityRating)}</TableCell>
                        <TableCell className="text-slate-500">{worker?.name}</TableCell>
                        <TableCell className="text-slate-500 max-w-xs truncate">{hr.notes ?? "—"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination page={harvestPage} totalPages={Math.ceil(harvests.length / PAGE_SIZE)} totalItems={harvests.length} pageSize={PAGE_SIZE} onChange={setHarvestPage} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

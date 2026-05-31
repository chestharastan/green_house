"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  mockGreenhouses, mockWaterBeds, mockCropBatches, mockCropTypes, mockHarvestRecords,
} from "@/lib/mock-data"
import type { Greenhouse, WaterBed } from "@/types/greenhouse"
import { Plus, Pencil, Building2, Rows3, BarChart2 } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

const PAGE_SIZE = 5
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type Tab = "greenhouses" | "beds" | "performance"

const stageVariant: Record<string, string> = {
  Seed: "secondary", Germination: "info", Transplanting: "warning",
  Growing: "default", Harvest: "destructive", Completed: "outline",
}

const bedStatusVariant: Record<string, string> = { Active: "default", Idle: "secondary", Maintenance: "warning" }

const glass = "bg-white/75 backdrop-blur-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.06)]"
const innerCell = "bg-black/[0.03] rounded-[10px]"

export default function GreenhousesPage() {
  const [tab, setTab] = useState<Tab>("greenhouses")
  const [greenhouses, setGreenhouses] = useState(mockGreenhouses)
  const [beds, setBeds] = useState(mockWaterBeds)
  const [bedsPage, setBedsPage] = useState(1)
  const [perfPage, setPerfPage] = useState(1)

  const [ghOpen, setGhOpen] = useState(false)
  const [ghEdit, setGhEdit] = useState<Greenhouse | null>(null)
  const [ghForm, setGhForm] = useState({ name: "", location: "", squareMeters: "", notes: "" })

  const [bOpen, setBOpen] = useState(false)
  const [bEdit, setBEdit] = useState<WaterBed | null>(null)
  const [bForm, setBForm] = useState({ greenhouseId: "", bedCode: "", lengthM: "", widthM: "", status: "Idle" as WaterBed["status"] })

  function saveGh() {
    if (!ghForm.name || !ghForm.location) return
    if (ghEdit) {
      setGreenhouses(greenhouses.map(g => g.id === ghEdit.id ? { ...g, ...ghForm, squareMeters: Number(ghForm.squareMeters) } : g))
    } else {
      setGreenhouses([...greenhouses, { id: `gh${Date.now()}`, ...ghForm, squareMeters: Number(ghForm.squareMeters), isActive: true }])
    }
    setGhOpen(false)
  }

  function saveBed() {
    if (!bForm.greenhouseId || !bForm.bedCode) return
    if (bEdit) {
      setBeds(beds.map(b => b.id === bEdit.id ? { ...b, ...bForm, lengthM: Number(bForm.lengthM), widthM: Number(bForm.widthM) } : b))
    } else {
      setBeds([...beds, { id: `bed${Date.now()}`, ...bForm, lengthM: Number(bForm.lengthM), widthM: Number(bForm.widthM) }])
    }
    setBOpen(false)
  }

  const bedPlantData = beds.map(bed => {
    const batch = mockCropBatches.find(b => b.bedId === bed.id && b.currentStage !== "Completed")
    return { bed, plants: batch?.seedlingCount ?? 0 }
  })

  const plantsPerBedChart = {
    labels: bedPlantData.map(d => d.bed.bedCode),
    datasets: [{
      label: "Plants",
      data: bedPlantData.map(d => d.plants),
      backgroundColor: bedPlantData.map(d =>
        d.plants === 0 ? "rgba(148,163,184,0.5)" : "rgba(22,163,74,0.75)"
      ),
      borderRadius: 6,
    }],
  }

  const harvestBatchData = mockHarvestRecords.map(hr => {
    const batch = mockCropBatches.find(b => b.id === hr.batchId)
    const crop = batch ? mockCropTypes.find(c => c.id === batch.cropTypeId) : null
    return { label: batch?.batchCode ?? hr.batchId, crop: crop?.name ?? "", yield: hr.yieldKg }
  })

  const harvestYieldChart = {
    labels: harvestBatchData.map(d => d.label),
    datasets: [{
      label: "Yield (kg)",
      data: harvestBatchData.map(d => d.yield),
      backgroundColor: "rgba(59,130,246,0.75)",
      borderRadius: 6,
    }],
  }

  const batchCompareData = mockCropBatches.map(batch => {
    const crop = mockCropTypes.find(c => c.id === batch.cropTypeId)
    const harvest = mockHarvestRecords.find(h => h.batchId === batch.id)
    return {
      label: batch.batchCode,
      crop: crop?.name ?? "",
      seedlings: batch.seedlingCount,
      yield: harvest?.yieldKg ?? 0,
      stage: batch.currentStage,
      bedId: batch.bedId,
    }
  })

  const batchCompareChart = {
    labels: batchCompareData.map(d => d.label),
    datasets: [
      {
        label: "Seedlings",
        data: batchCompareData.map(d => d.seedlings),
        backgroundColor: "rgba(22,163,74,0.7)",
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        label: "Yield (kg)",
        data: batchCompareData.map(d => d.yield),
        backgroundColor: "rgba(249,115,22,0.7)",
        borderRadius: 4,
        yAxisID: "y1",
      },
    ],
  }

  return (
    <div className="space-y-5" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif', letterSpacing: '-0.01em' }}>

      {/* Tab bar */}
      <div className="flex gap-0.5 bg-black/[0.05] backdrop-blur-xl p-1 rounded-[14px] w-fit border border-black/[0.04]">
        {([["greenhouses", "Greenhouses", Building2], ["beds", "Water Beds", Rows3], ["performance", "Performance", BarChart2]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[13px] font-medium tracking-[-0.01em] transition-all ${
              tab === key
                ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_1px_rgba(0,0,0,0.06)] text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── Greenhouses Tab ── */}
      {tab === "greenhouses" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={ghOpen} onOpenChange={setGhOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => { setGhEdit(null); setGhForm({ name: "", location: "", squareMeters: "", notes: "" }) }}
                  className="rounded-[10px] text-[13px] font-medium tracking-[-0.01em] gap-1.5"
                >
                  <Plus size={14} /> Add Greenhouse
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[18px]">
                <DialogHeader><DialogTitle className="text-[15px] font-semibold tracking-[-0.01em]">{ghEdit ? "Edit Greenhouse" : "Add Greenhouse"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Name</Label><Input placeholder="GH1 - Main" value={ghForm.name} onChange={e => setGhForm({ ...ghForm, name: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                  <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Location</Label><Input placeholder="North Block" value={ghForm.location} onChange={e => setGhForm({ ...ghForm, location: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                  <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Area (m²)</Label><Input type="number" placeholder="500" value={ghForm.squareMeters} onChange={e => setGhForm({ ...ghForm, squareMeters: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                  <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Notes</Label><Textarea placeholder="Optional notes..." value={ghForm.notes} onChange={e => setGhForm({ ...ghForm, notes: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={saveGh} className="flex-1 rounded-[10px] text-[13px] font-medium">Save</Button>
                    <Button variant="outline" onClick={() => setGhOpen(false)} className="flex-1 rounded-[10px] text-[13px] font-medium">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {greenhouses.map(gh => {
              const ghBeds = beds.filter(b => b.greenhouseId === gh.id)
              const activeCount = ghBeds.filter(b => b.status === "Active").length
              const idleCount = ghBeds.filter(b => b.status === "Idle").length
              const maintCount = ghBeds.filter(b => b.status === "Maintenance").length

              const growingCrops = Array.from(new Set(
                ghBeds.flatMap(bed => {
                  const batch = mockCropBatches.find(b => b.bedId === bed.id && b.currentStage !== "Completed")
                  if (!batch) return []
                  const crop = mockCropTypes.find(c => c.id === batch.cropTypeId)
                  return crop ? [crop.name] : []
                })
              ))

              return (
                <div key={gh.id} className={`${glass} rounded-[18px] p-5`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-[15px] text-slate-800 tracking-[-0.02em]">{gh.name}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{gh.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={gh.isActive ? "default" : "secondary"} className="text-[11px] px-2 py-0.5 rounded-full font-medium">{gh.isActive ? "Active" : "Inactive"}</Badge>
                      <button
                        onClick={() => {
                          setGhEdit(gh)
                          setGhForm({ name: gh.name, location: gh.location, squareMeters: String(gh.squareMeters), notes: gh.notes ?? "" })
                          setGhOpen(true)
                        }}
                        className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-black/[0.05] transition-all"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className={`${innerCell} p-3 text-center`}>
                      <p className="text-[20px] font-bold text-slate-800 tracking-[-0.03em] leading-none">{gh.squareMeters}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">m²</p>
                    </div>
                    <div className={`${innerCell} p-3 text-center`}>
                      <p className="text-[20px] font-bold text-slate-800 tracking-[-0.03em] leading-none">{ghBeds.length}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">Water Beds</p>
                    </div>
                  </div>

                  {/* Bed status breakdown */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {activeCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Active: {activeCount}
                      </span>
                    )}
                    {idleCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />Idle: {idleCount}
                      </span>
                    )}
                    {maintCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />Maintenance: {maintCount}
                      </span>
                    )}
                  </div>

                  {/* Currently growing crops */}
                  {growingCrops.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {growingCrops.map(crop => (
                        <span key={crop} className="flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />{crop}
                        </span>
                      ))}
                    </div>
                  )}

                  {gh.notes && <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">{gh.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Water Beds Tab ── */}
      {tab === "beds" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={bOpen} onOpenChange={setBOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={() => { setBEdit(null); setBForm({ greenhouseId: "", bedCode: "", lengthM: "", widthM: "", status: "Idle" }) }}
                  className="rounded-[10px] text-[13px] font-medium tracking-[-0.01em] gap-1.5"
                >
                  <Plus size={14} /> Add Bed
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[18px]">
                <DialogHeader><DialogTitle className="text-[15px] font-semibold tracking-[-0.01em]">{bEdit ? "Edit Water Bed" : "Add Water Bed"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-slate-600">Greenhouse</Label>
                    <Select value={bForm.greenhouseId} onValueChange={v => setBForm({ ...bForm, greenhouseId: v })}>
                      <SelectTrigger className="rounded-[10px] text-[13px]"><SelectValue placeholder="Select greenhouse" /></SelectTrigger>
                      <SelectContent>{greenhouses.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Bed Code</Label><Input placeholder="BED01" value={bForm.bedCode} onChange={e => setBForm({ ...bForm, bedCode: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Length (m)</Label><Input type="number" placeholder="10" value={bForm.lengthM} onChange={e => setBForm({ ...bForm, lengthM: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                    <div className="space-y-1.5"><Label className="text-[13px] text-slate-600">Width (m)</Label><Input type="number" placeholder="1.5" value={bForm.widthM} onChange={e => setBForm({ ...bForm, widthM: e.target.value })} className="rounded-[10px] text-[13px]" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] text-slate-600">Status</Label>
                    <Select value={bForm.status} onValueChange={v => setBForm({ ...bForm, status: v as WaterBed["status"] })}>
                      <SelectTrigger className="rounded-[10px] text-[13px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Active", "Idle", "Maintenance"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={saveBed} className="flex-1 rounded-[10px] text-[13px] font-medium">Save</Button>
                    <Button variant="outline" onClick={() => setBOpen(false)} className="flex-1 rounded-[10px] text-[13px] font-medium">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className={`${glass} rounded-[18px] overflow-hidden`}>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.05]">
                  {["Bed Code", "Greenhouse", "Size", "Status", "Current Crop", "Stage", ""].map(h => (
                    <TableHead key={h} className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] py-3">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {beds.slice((bedsPage - 1) * PAGE_SIZE, bedsPage * PAGE_SIZE).map(bed => {
                  const gh = greenhouses.find(g => g.id === bed.greenhouseId)
                  const batch = mockCropBatches.find(b => b.id === bed.currentBatchId)
                  const crop = batch ? mockCropTypes.find(c => c.id === batch.cropTypeId) : null
                  return (
                    <TableRow key={bed.id} className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                      <TableCell className="font-semibold text-[13px] text-slate-800 py-3">{bed.bedCode}</TableCell>
                      <TableCell className="text-[13px] text-slate-500">{gh?.name}</TableCell>
                      <TableCell className="text-[13px] text-slate-500">{bed.lengthM}m × {bed.widthM}m</TableCell>
                      <TableCell><Badge variant={bedStatusVariant[bed.status]} className="text-[11px] rounded-full px-2 py-0.5">{bed.status}</Badge></TableCell>
                      <TableCell>
                        {crop
                          ? <span className="text-[13px] text-slate-700">{crop.name} <span className="text-slate-400">({batch?.seedlingCount} plants)</span></span>
                          : <span className="text-slate-300 text-[13px]">—</span>}
                      </TableCell>
                      <TableCell>
                        {batch
                          ? <Badge variant={stageVariant[batch.currentStage]} className="text-[11px] rounded-full px-2 py-0.5">{batch.currentStage}</Badge>
                          : <span className="text-slate-300 text-[13px]">—</span>}
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <button
                          onClick={() => {
                            setBEdit(bed)
                            setBForm({ greenhouseId: bed.greenhouseId, bedCode: bed.bedCode, lengthM: String(bed.lengthM), widthM: String(bed.widthM), status: bed.status })
                            setBOpen(true)
                          }}
                          className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-600 hover:bg-black/[0.05] transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination page={bedsPage} totalPages={Math.ceil(beds.length / PAGE_SIZE)} totalItems={beds.length} pageSize={PAGE_SIZE} onChange={setBedsPage} />
          </div>
        </div>
      )}

      {/* ── Performance Tab ── */}
      {tab === "performance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${glass} rounded-[18px] p-5`}>
              <p className="text-[15px] font-semibold text-slate-800 tracking-[-0.02em]">Plants per Water Bed</p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-4">Active plants currently growing in each bed</p>
              <Bar
                data={plantsPerBedChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        afterLabel: (ctx) => {
                          const bed = beds[ctx.dataIndex]
                          const gh = greenhouses.find(g => g.id === bed.greenhouseId)
                          return `Greenhouse: ${gh?.name ?? "—"}`
                        },
                      },
                    },
                  },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>

            <div className={`${glass} rounded-[18px] p-5`}>
              <p className="text-[15px] font-semibold text-slate-800 tracking-[-0.02em]">Harvest Yield per Batch</p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-4">Total kg harvested from each completed batch</p>
              <Bar
                data={harvestYieldChart}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, title: { display: true, text: "kg" } } },
                }}
              />
            </div>
          </div>

          <div className={`${glass} rounded-[18px] p-5`}>
            <p className="text-[15px] font-semibold text-slate-800 tracking-[-0.02em]">Batch Comparison — Seedlings vs Yield</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-4">Green = seedlings (left axis) · Orange = harvest yield kg (right axis)</p>
            <Bar
              data={batchCompareChart}
              options={{
                responsive: true,
                plugins: { legend: { position: "top" } },
                scales: {
                  y: {
                    beginAtZero: true,
                    position: "left",
                    title: { display: true, text: "Seedlings" },
                  },
                  y1: {
                    beginAtZero: true,
                    position: "right",
                    title: { display: true, text: "Yield (kg)" },
                    grid: { drawOnChartArea: false },
                  },
                },
              }}
            />
          </div>

          <div className={`${glass} rounded-[18px] overflow-hidden`}>
            <div className="px-5 py-4 border-b border-black/[0.05]">
              <p className="text-[15px] font-semibold text-slate-800 tracking-[-0.02em]">Batch Performance Summary</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.05]">
                  {["Batch", "Crop", "Bed", "Seedlings", "Stage", "Yield (kg)", "kg / plant"].map(h => (
                    <TableHead key={h} className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] py-3">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchCompareData.slice((perfPage - 1) * PAGE_SIZE, perfPage * PAGE_SIZE).map(row => {
                  const bed = beds.find(b => b.id === row.bedId)
                  const kgPerPlant = row.yield > 0 && row.seedlings > 0
                    ? (row.yield / row.seedlings).toFixed(3) : "—"
                  return (
                    <TableRow key={row.label} className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors">
                      <TableCell className="font-semibold text-[13px] text-slate-800 py-3">{row.label}</TableCell>
                      <TableCell className="text-[13px] text-slate-500">{row.crop}</TableCell>
                      <TableCell className="text-[13px] text-slate-500">{bed?.bedCode ?? "—"}</TableCell>
                      <TableCell className="text-[13px] text-slate-700">{row.seedlings}</TableCell>
                      <TableCell><Badge variant={stageVariant[row.stage]} className="text-[11px] rounded-full px-2 py-0.5">{row.stage}</Badge></TableCell>
                      <TableCell className="font-semibold text-[13px] text-blue-600">{row.yield > 0 ? `${row.yield} kg` : "—"}</TableCell>
                      <TableCell className="text-[13px] text-slate-400">{kgPerPlant}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <Pagination page={perfPage} totalPages={Math.ceil(batchCompareData.length / PAGE_SIZE)} totalItems={batchCompareData.length} pageSize={PAGE_SIZE} onChange={setPerfPage} />
          </div>
        </div>
      )}
    </div>
  )
}

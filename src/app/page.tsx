"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Building2, Sprout, Users, TrendingUp, AlertTriangle, Activity, Package } from "lucide-react"
import {
  mockGreenhouses, mockCropBatches, mockHarvestRecords, mockInventory,
  mockUsers, mockTasks, mockWaterBeds, mockMonitoringRecords,
} from "@/lib/mock-data"
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const stageVariant: Record<string, "default" | "secondary" | "info" | "warning" | "destructive" | "outline"> = {
  Seed: "secondary",
  Germination: "info",
  Transplanting: "warning",
  Growing: "default",
  Harvest: "destructive",
  Completed: "outline",
}

export default function DashboardPage() {
  const activeCrops = mockCropBatches.filter(b => b.currentStage !== "Completed").length
  const lowStockItems = mockInventory.filter(i => i.currentStock <= i.minimumStock)
  const pendingTasks = mockTasks.filter(t => t.status === "Pending" || t.status === "InProgress").length
  const activeWorkers = mockUsers.filter(u => u.isActive && u.role === "Worker").length
  const criticalReadings = mockMonitoringRecords.filter(
    m => m.phStatus === "Critical" || m.ecStatus === "Critical" || m.tempStatus === "Critical"
  ).length

  const harvestData = {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ label: "Yield (kg)", data: [18.2, 36.7, 0], backgroundColor: "rgba(22,163,74,0.75)", borderRadius: 6 }],
  }

  const phTrend = {
    labels: ["Mar 1", "Mar 2", "Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7"],
    datasets: [{
      label: "Avg pH", data: [6.0, 6.1, 6.0, 6.2, 6.1, 6.3, 6.2],
      borderColor: "rgb(22,163,74)", backgroundColor: "rgba(22,163,74,0.1)", tension: 0.4, fill: true,
    }],
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Building2 size={16} className="text-green-600" />} iconBg="rgba(22,163,74,0.12)" label="Greenhouses" value={mockGreenhouses.length} sub="2 active" />
        <StatCard icon={<Sprout size={16} className="text-blue-600" />} iconBg="rgba(37,99,235,0.12)" label="Active Crops" value={activeCrops} sub="across 5 beds" />
        <StatCard icon={<Users size={16} className="text-violet-600" />} iconBg="rgba(124,58,237,0.12)" label="Active Workers" value={activeWorkers} sub={`${pendingTasks} tasks open`} />
        <StatCard icon={<TrendingUp size={16} className="text-orange-600" />} iconBg="rgba(234,88,12,0.12)" label="Total Harvest" value="55.5 kg" sub="this season" />
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || criticalReadings > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lowStockItems.length > 0 && (
            <Card className="bg-amber-50/80 border-amber-200/60">
              <CardContent className="py-3.5 px-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 text-[12px] tracking-[-0.01em]">Low Stock Alert</p>
                    <p className="text-[12px] text-amber-700/80 mt-0.5 tracking-[-0.01em]">{lowStockItems.map(i => i.name).join(", ")} below minimum stock.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {criticalReadings > 0 && (
            <Card className="bg-red-50/80 border-red-200/60">
              <CardContent className="py-3.5 px-4">
                <div className="flex items-start gap-3">
                  <Activity size={15} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 text-[12px] tracking-[-0.01em]">Critical Monitoring Alert</p>
                    <p className="text-[12px] text-red-700/80 mt-0.5 tracking-[-0.01em]">{criticalReadings} critical reading(s) need immediate attention.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Harvest Yield (kg)</CardTitle></CardHeader>
          <CardContent>
            <Bar data={harvestData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>pH Trend — Last 7 Days</CardTitle></CardHeader>
          <CardContent>
            <Line data={phTrend} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 5, max: 7.5 } } }} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Active Crop Batches</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/[0.04]">
              {mockCropBatches.filter(b => b.currentStage !== "Completed").map(batch => {
                const bed = mockWaterBeds.find(b => b.id === batch.bedId)
                return (
                  <div key={batch.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{batch.batchCode}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Bed: {bed?.bedCode} · {batch.seedlingCount} plants</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={stageVariant[batch.currentStage]}>{batch.currentStage}</Badge>
                      <p className="text-xs text-slate-400 mt-1">Est. {batch.estimatedHarvestDate}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Harvests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/[0.04]">
              {mockHarvestRecords.map(hr => {
                const batch = mockCropBatches.find(b => b.id === hr.batchId)
                return (
                  <div key={hr.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{batch?.batchCode}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{hr.harvestedAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{hr.yieldKg} kg</p>
                      <p className="text-xs text-amber-400 mt-0.5">{"★".repeat(hr.qualityRating)}{"☆".repeat(5 - hr.qualityRating)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package size={16} /> Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/[0.04]">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-500">{item.currentStock} {item.unit}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Min: {item.minimumStock} {item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

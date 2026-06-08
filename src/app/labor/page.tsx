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
import { mockTasks, mockWorkHours, mockUsers } from "@/lib/mock-data"
import type { Task, WorkHourRecord } from "@/types/labor"
import { Plus, Pencil, Clock, ListChecks, CircleDashed, CheckCircle2 } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { Pagination } from "@/components/ui/pagination"

const PAGE_SIZE = 5

type Tab = "tasks" | "hours"

type BadgeVariant = "default" | "secondary" | "destructive" | "warning" | "info" | "outline"

const statusVariant: Record<Task["status"], BadgeVariant> = {
  Pending: "secondary", InProgress: "info", Done: "default", Cancelled: "outline",
}
const priorityVariant: Record<Task["priority"], BadgeVariant> = {
  Low: "secondary", Medium: "info", High: "warning", Urgent: "destructive",
}

export default function LaborPage() {
  const [tab, setTab] = useState<Tab>("tasks")
  const [tasks, setTasks] = useState(mockTasks)
  const [hours, setHours] = useState(mockWorkHours)
  const [tasksPage, setTasksPage] = useState(1)
  const [hoursPage, setHoursPage] = useState(1)

  const [tOpen, setTOpen] = useState(false)
  const [tEdit, setTEdit] = useState<Task | null>(null)
  const [tForm, setTForm] = useState({
    title: "", description: "", priority: "Medium" as Task["priority"],
    assignedTo: "", dueDate: "", status: "Pending" as Task["status"],
  })

  const [hOpen, setHOpen] = useState(false)
  const [hForm, setHForm] = useState({ workerId: "", taskId: "", clockIn: "", clockOut: "", notes: "" })

  function saveTask() {
    if (!tForm.title) return
    const today = new Date().toISOString().split("T")[0]
    if (tEdit) {
      setTasks(tasks.map(t => t.id === tEdit.id ? {
        ...t, ...tForm, completedAt: tForm.status === "Done" ? today : t.completedAt,
      } : t))
    } else {
      setTasks([...tasks, {
        id: `t${Date.now()}`, ...tForm, createdBy: "u1", createdAt: today,
      }])
    }
    setTOpen(false)
  }

  function saveHours() {
    if (!hForm.workerId || !hForm.taskId || !hForm.clockIn || !hForm.clockOut) return
    const cin = new Date(hForm.clockIn)
    const cout = new Date(hForm.clockOut)
    const hoursLogged = Math.round((cout.getTime() - cin.getTime()) / 36e5 * 10) / 10
    const wh: WorkHourRecord = {
      id: `wh${Date.now()}`, ...hForm, hoursLogged, notes: hForm.notes,
    }
    setHours([wh, ...hours])
    setHOpen(false)
  }

  const workers = mockUsers.filter(u => u.isActive)

  // Summary stats
  const totalHours = hours.reduce((s, h) => s + (h.hoursLogged ?? 0), 0)
  const openTasks = tasks.filter(t => t.status !== "Done" && t.status !== "Cancelled").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<ListChecks size={16} className="text-violet-600" />} iconBg="rgba(124,58,237,0.12)" label="Total Tasks" value={tasks.length} />
        <StatCard icon={<CircleDashed size={16} className="text-orange-600" />} iconBg="rgba(234,88,12,0.12)" label="Open Tasks" value={openTasks} />
        <StatCard icon={<CheckCircle2 size={16} className="text-green-600" />} iconBg="rgba(22,163,74,0.12)" label="Completed" value={tasks.filter(t => t.status === "Done").length} />
        <StatCard icon={<Clock size={16} className="text-blue-600" />} iconBg="rgba(37,99,235,0.12)" label="Hours Logged" value={`${totalHours}h`} />
      </div>

      <div className="flex gap-0.5 bg-slate-100 p-1 rounded-xl w-fit">
        {([["tasks", "Tasks"], ["hours", "Work Hours"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={tOpen} onOpenChange={setTOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setTEdit(null); setTForm({ title: "", description: "", priority: "Medium", assignedTo: "", dueDate: "", status: "Pending" }) }}>
                  <Plus size={16} /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{tEdit ? "Edit Task" : "Create Task"}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label>Title</Label><Input placeholder="Task title" value={tForm.title} onChange={e => setTForm({ ...tForm, title: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea placeholder="Details..." value={tForm.description} onChange={e => setTForm({ ...tForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <Select value={tForm.priority} onValueChange={v => setTForm({ ...tForm, priority: v as Task["priority"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["Low", "Medium", "High", "Urgent"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select value={tForm.status} onValueChange={v => setTForm({ ...tForm, status: v as Task["status"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["Pending", "InProgress", "Done", "Cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assign To</Label>
                    <Select value={tForm.assignedTo} onValueChange={v => setTForm({ ...tForm, assignedTo: v })}>
                      <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                      <SelectContent>{workers.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={tForm.dueDate} onChange={e => setTForm({ ...tForm, dueDate: e.target.value })} /></div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveTask} className="flex-1">Save</Button><Button variant="outline" onClick={() => setTOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.slice((tasksPage - 1) * PAGE_SIZE, tasksPage * PAGE_SIZE).map(task => {
                    const assignee = workers.find(u => u.id === task.assignedTo)
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          {task.description && <p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p>}
                        </TableCell>
                        <TableCell><Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge></TableCell>
                        <TableCell className="text-gray-500">{assignee?.name ?? "—"}</TableCell>
                        <TableCell className="text-gray-500">{task.dueDate ?? "—"}</TableCell>
                        <TableCell><Badge variant={statusVariant[task.status]}>{task.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setTEdit(task)
                            setTForm({ title: task.title, description: task.description ?? "", priority: task.priority, assignedTo: task.assignedTo ?? "", dueDate: task.dueDate ?? "", status: task.status })
                            setTOpen(true)
                          }}>
                            <Pencil size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination page={tasksPage} totalPages={Math.ceil(tasks.length / PAGE_SIZE)} totalItems={tasks.length} pageSize={PAGE_SIZE} onChange={setTasksPage} />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "hours" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={hOpen} onOpenChange={setHOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setHForm({ workerId: "", taskId: "", clockIn: "", clockOut: "", notes: "" })}>
                  <Clock size={16} /> Log Work Hours
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Log Work Hours</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Worker</Label>
                    <Select value={hForm.workerId} onValueChange={v => setHForm({ ...hForm, workerId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                      <SelectContent>{workers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Task</Label>
                    <Select value={hForm.taskId} onValueChange={v => setHForm({ ...hForm, taskId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                      <SelectContent>{tasks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Clock In</Label><Input type="datetime-local" value={hForm.clockIn} onChange={e => setHForm({ ...hForm, clockIn: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Clock Out</Label><Input type="datetime-local" value={hForm.clockOut} onChange={e => setHForm({ ...hForm, clockOut: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="..." value={hForm.notes} onChange={e => setHForm({ ...hForm, notes: e.target.value })} /></div>
                  <div className="flex gap-2 pt-2"><Button onClick={saveHours} className="flex-1">Save</Button><Button variant="outline" onClick={() => setHOpen(false)} className="flex-1">Cancel</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hours.slice((hoursPage - 1) * PAGE_SIZE, hoursPage * PAGE_SIZE).map(wh => {
                    const worker = workers.find(u => u.id === wh.workerId)
                    const task = tasks.find(t => t.id === wh.taskId)
                    return (
                      <TableRow key={wh.id}>
                        <TableCell className="font-medium">{worker?.name}</TableCell>
                        <TableCell className="text-gray-500 max-w-[200px] truncate">{task?.title}</TableCell>
                        <TableCell className="text-gray-500">{wh.clockIn.replace("T", " ")}</TableCell>
                        <TableCell className="text-gray-500">{wh.clockOut?.replace("T", " ")}</TableCell>
                        <TableCell className="font-semibold text-blue-700">{wh.hoursLogged}h</TableCell>
                        <TableCell className="text-gray-500 max-w-xs truncate">{wh.notes ?? "—"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <Pagination page={hoursPage} totalPages={Math.ceil(hours.length / PAGE_SIZE)} totalItems={hours.length} pageSize={PAGE_SIZE} onChange={setHoursPage} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

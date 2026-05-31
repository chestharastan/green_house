"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockUsers } from "@/lib/mock-data"
import type { User, UserRole } from "@/types/auth"
import { Plus, Pencil, UserCheck, UserX } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

const PAGE_SIZE = 5

const roleVariant: Record<UserRole, "default" | "info" | "secondary" | "destructive"> = {
  Admin: "destructive",
  FarmManager: "default",
  Worker: "secondary",
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({ name: "", email: "", role: "Worker" as UserRole })

  function openAdd() {
    setEditing(null)
    setForm({ name: "", email: "", role: "Worker" })
    setOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setForm({ name: user.name, email: user.email, role: user.role })
    setOpen(true)
  }

  function save() {
    if (!form.name || !form.email) return
    if (editing) {
      setUsers(users.map(u => u.id === editing.id ? { ...u, ...form } : u))
    } else {
      const newUser: User = {
        id: `u${Date.now()}`, ...form, isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setUsers([...users, newUser])
    }
    setOpen(false)
  }

  function toggleActive(id: string) {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{users.filter(u => u.isActive).length} active · {users.length} total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus size={16} /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="e.g. Sara Chen" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="sara@greenhouse.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="FarmManager">Farm Manager</SelectItem>
                    <SelectItem value="Worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={save} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-500">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Edit">
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(user.id)} title={user.isActive ? "Deactivate" : "Activate"}>
                        {user.isActive ? <UserX size={15} className="text-red-500" /> : <UserCheck size={15} className="text-green-600" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} totalPages={Math.ceil(users.length / PAGE_SIZE)} totalItems={users.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </CardContent>
      </Card>
    </div>
  )
}

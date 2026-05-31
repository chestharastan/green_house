"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Building2, Sprout, Package, Users, Activity, Zap,
  Settings, Leaf, User, ChevronsUpDown, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: null,
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/greenhouses", label: "Greenhouses", icon: Building2 },
      { href: "/crops", label: "Crops", icon: Sprout },
      { href: "/inventory", label: "Inventory", icon: Package },
      { href: "/labor", label: "Labor", icon: Users },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/monitoring", label: "Monitoring", icon: Activity },
      { href: "/utilities", label: "Utilities", icon: Zap },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/users", label: "Users", icon: Settings },
    ],
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-[220px] flex flex-col transition-transform duration-300",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          borderRight: "0.5px solid rgba(0, 0, 0, 0.07)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-4 h-14 shrink-0"
          style={{ borderBottom: "0.5px solid rgba(0, 0, 0, 0.06)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="shrink-0 p-[7px] rounded-[10px]"
              style={{
                background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                boxShadow: "0 1px 4px rgba(22,163,74,0.45), 0 0 0 0.5px rgba(74,222,128,0.2)",
              }}
            >
              <Leaf className="h-[15px] w-[15px] text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[13px] text-slate-900 leading-tight tracking-[-0.025em]">HydroFarm</p>
              <p className="text-[10px] text-slate-400 leading-tight">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden shrink-0 text-slate-400 hover:text-slate-700 p-1 rounded-[6px] hover:bg-black/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-5" : ""}>
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-2.5 px-3 py-[7px] rounded-[10px] text-[13px] font-medium transition-all duration-150",
                        active
                          ? "text-green-800"
                          : "text-slate-500 hover:text-slate-800 hover:bg-black/[0.04]"
                      )}
                      style={active ? {
                        background: "rgba(22, 163, 74, 0.09)",
                        border: "0.5px solid rgba(22, 163, 74, 0.18)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      } : undefined}
                    >
                      <Icon
                        size={15}
                        className={cn(
                          "shrink-0 transition-colors duration-150",
                          active ? "text-green-600" : "text-slate-400"
                        )}
                      />
                      <span className="tracking-[-0.01em]">{label}</span>
                      {active && (
                        <span
                          className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-green-500"
                          style={{ boxShadow: "0 0 4px rgba(22,163,74,0.6)" }}
                        />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-2.5" style={{ borderTop: "0.5px solid rgba(0, 0, 0, 0.06)" }}>
          <button className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px] hover:bg-black/[0.04] transition-all duration-150 group text-left">
            <div
              className="h-[28px] w-[28px] rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
                boxShadow: "0 1px 3px rgba(22,163,74,0.4)",
              }}
            >
              <User size={13} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800 leading-tight tracking-[-0.02em] truncate">Admin User</p>
              <p className="text-[10px] text-slate-400 leading-tight mt-px">Administrator</p>
            </div>
            <ChevronsUpDown
              size={13}
              className="text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors"
            />
          </button>
        </div>
      </aside>
    </>
  )
}

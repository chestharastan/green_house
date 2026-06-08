"use client"
import { useState } from "react"
import { Menu, Bell, User } from "lucide-react"
import { Sidebar } from "./sidebar"
import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/greenhouses": "Greenhouse Management",
  "/crops": "Crop Production",
  "/inventory": "Inventory Management",
  "/labor": "Labor & Tasks",
  "/monitoring": "Water Bed Monitoring",
  "/utilities": "Utility Tracking",
  "/users": "User Management",
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? "HydroFarm"

  return (
    <div className="app-bg flex h-screen overflow-hidden">
      {/* Ambient color blobs — give the blur something to refract */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 12% 8%, rgba(129, 161, 217, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 45% 55% at 88% 88%, rgba(99, 179, 237, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 38% 38% at 62% 28%, rgba(186, 200, 224, 0.12) 0%, transparent 55%)
          `,
        }}
      />

      <div className="relative z-10 flex h-full w-full">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header — frosted glass */}
          <header
            className="px-4 lg:px-6 h-14 flex items-center justify-between shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              borderBottom: "0.5px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 0.5px 0 rgba(255, 255, 255, 0.8) inset",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-[8px] hover:bg-black/[0.05] transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-[13px] font-semibold text-slate-800 tracking-[-0.025em]">{title}</h1>
            </div>

            <div className="flex items-center gap-1">
              <button className="relative text-slate-400 hover:text-slate-600 p-2 rounded-[8px] hover:bg-black/[0.05] transition-colors">
                <Bell size={16} />
                <span className="absolute top-[7px] right-[7px] h-1.5 w-1.5 bg-red-500 rounded-full" />
              </button>
              <div
                className="flex items-center gap-2 ml-1 pl-3"
                style={{ borderLeft: "0.5px solid rgba(0, 0, 0, 0.08)" }}
              >
                <div className="h-[28px] w-[28px] bg-green-600 rounded-full flex items-center justify-center shrink-0"
                  style={{ boxShadow: "0 1px 3px rgba(22,163,74,0.35)" }}
                >
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[12px] font-semibold text-slate-800 leading-tight tracking-[-0.02em]">Admin User</p>
                  <p className="text-[11px] text-slate-400 leading-tight">Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

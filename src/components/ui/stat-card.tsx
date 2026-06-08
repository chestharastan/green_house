import { Card, CardContent } from "@/components/ui/card"

export function StatCard({ icon, iconBg, label, value, sub }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: React.ReactNode
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 p-[9px] rounded-[10px]"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-medium tracking-[-0.01em] truncate">{label}</p>
            <p className="text-[20px] font-bold text-slate-900 leading-tight mt-0.5 tracking-[-0.03em]">{value}</p>
            {sub && <p className="text-[11px] text-slate-400 mt-0.5 tracking-[-0.01em] truncate">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

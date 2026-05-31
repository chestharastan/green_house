import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-[3px] text-[11px] font-medium tracking-[-0.01em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-green-500/15 text-green-700",
        secondary: "bg-black/[0.06] text-slate-600",
        destructive: "bg-red-500/15 text-red-700",
        warning: "bg-amber-500/15 text-amber-700",
        info: "bg-blue-500/15 text-blue-700",
        outline: "border border-black/[0.1] text-slate-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

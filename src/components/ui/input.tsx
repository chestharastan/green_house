import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-[10px] text-[13px] text-slate-800 tracking-[-0.01em] placeholder:text-slate-400/80 transition-all duration-150",
      "px-3 py-2 bg-white/80 backdrop-blur-sm",
      "border border-black/[0.08]",
      "shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(0,0,0,0.03)]",
      "focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"
export { Input }

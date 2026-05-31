interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalItems, pageSize, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  return (
    <div
      className="flex items-center justify-between px-5 py-3"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}
    >
      <p className="text-[12px] text-slate-400">
        {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-7 px-3 rounded-[7px] text-[12px] font-medium text-slate-600 hover:bg-black/[0.05] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="h-7 w-7 rounded-[7px] text-[12px] font-medium transition-colors"
            style={
              page === n
                ? { background: "rgba(22,163,74,0.1)", color: "#15803d", border: "0.5px solid rgba(22,163,74,0.2)" }
                : { color: "#64748b" }
            }
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-7 px-3 rounded-[7px] text-[12px] font-medium text-slate-600 hover:bg-black/[0.05] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

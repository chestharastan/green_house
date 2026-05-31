import { useState } from 'react'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, hint, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderTopColor: accent } : undefined}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}

const BADGE_TONES = {
  Active: 'green', Growing: 'green', Done: 'green', IN: 'green',
  Pending: 'amber', 'In Progress': 'blue', Transplanting: 'blue',
  Germination: 'gray', Maintenance: 'amber', 'On Leave': 'gray',
  Harvest: 'purple', OUT: 'red',
}
export function Badge({ children }) {
  const tone = BADGE_TONES[children] || 'gray'
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Table({ columns, rows, empty = 'No records yet.' }) {
  if (!rows.length) return <div className="card empty">{empty}</div>
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Lightweight modal with a built-in field-driven form.
export function FormModal({ title, fields, onClose, onSubmit }) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.name, f.default ?? '']))
  )

  function set(name, value) {
    setValues((v) => ({ ...v, [name]: value }))
  }

  function submit(e) {
    e.preventDefault()
    onSubmit(values)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="form">
          {fields.map((f) => (
            <label key={f.name} className="field">
              <span>{f.label}{f.required && ' *'}</span>
              {f.type === 'select' ? (
                <select
                  value={values[f.name]}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                >
                  <option value="">— select —</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={values[f.name]}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  step={f.type === 'number' ? 'any' : undefined}
                  value={values[f.name]}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
            </label>
          ))}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

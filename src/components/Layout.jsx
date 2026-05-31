import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Warehouse, Sprout, Layers, Users,
  ClipboardList, Clock, Package, ArrowLeftRight,
  Thermometer, BarChart2, Leaf,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, roles: ['Admin', 'Farm Manager', 'Worker'], group: 'Overview' },
  { to: '/greenhouses', label: 'Greenhouses', Icon: Warehouse, roles: ['Admin', 'Farm Manager'], group: 'Farm' },
  { to: '/crop-batches', label: 'Crop Batches', Icon: Sprout, roles: ['Admin', 'Farm Manager'], group: 'Farm' },
  { to: '/crop-stages', label: 'Crop Stages', Icon: Layers, roles: ['Admin', 'Farm Manager', 'Worker'], group: 'Farm' },
  { to: '/sensors', label: 'Sensor Data', Icon: Thermometer, roles: ['Admin', 'Farm Manager', 'Worker'], group: 'Farm' },
  { to: '/workers', label: 'Workers', Icon: Users, roles: ['Admin', 'Farm Manager'], group: 'Labor' },
  { to: '/tasks', label: 'Tasks', Icon: ClipboardList, roles: ['Admin', 'Farm Manager', 'Worker'], group: 'Labor' },
  { to: '/work-hours', label: 'Work Hours', Icon: Clock, roles: ['Admin', 'Farm Manager', 'Worker'], group: 'Labor' },
  { to: '/inventory', label: 'Inventory', Icon: Package, roles: ['Admin', 'Farm Manager'], group: 'Stock' },
  { to: '/inventory/transactions', label: 'Stock In/Out', Icon: ArrowLeftRight, roles: ['Admin', 'Farm Manager'], group: 'Stock' },
  { to: '/reports', label: 'Reports', Icon: BarChart2, roles: ['Admin', 'Farm Manager'], group: 'Reports' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo"><Leaf size={28} /></span>
          <div>
            <div className="brand-title">SmartFarm RUPP</div>
            <div className="brand-sub">Farm Management</div>
          </div>
        </div>
        <nav>
          {(() => {
            const visible = NAV.filter((n) => n.roles.includes(user.role))
            const seen = new Set()
            return visible.map((n) => {
              const showLabel = !seen.has(n.group) && seen.add(n.group)
              return (
                <div key={n.to}>
                  {showLabel && <div className="nav-section-label">{n.group}</div>}
                  <NavLink to={n.to} end={n.to === '/'} className="nav-item">
                    <span className="nav-icon"><n.Icon size={17} /></span>
                    {n.label}
                  </NavLink>
                </div>
              )
            })
          })()}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">SmartFarm RUPP — Management System</div>
          <div className="user-box">
            <div className="user-meta">
              <div className="user-name">{user.fullName}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

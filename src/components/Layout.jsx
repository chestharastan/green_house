import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Warehouse, Sprout, Layers, Users,
  ClipboardList, Clock, Package, ArrowLeftRight,
  Thermometer, BarChart2, Leaf,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, roles: ['Admin', 'Farm Manager', 'Worker'] },
  { to: '/greenhouses', label: 'Greenhouses', Icon: Warehouse, roles: ['Admin', 'Farm Manager'] },
  { to: '/crop-batches', label: 'Crop Batches', Icon: Sprout, roles: ['Admin', 'Farm Manager'] },
  { to: '/crop-stages', label: 'Crop Stages', Icon: Layers, roles: ['Admin', 'Farm Manager', 'Worker'] },
  { to: '/workers', label: 'Workers', Icon: Users, roles: ['Admin', 'Farm Manager'] },
  { to: '/tasks', label: 'Tasks', Icon: ClipboardList, roles: ['Admin', 'Farm Manager', 'Worker'] },
  { to: '/work-hours', label: 'Work Hours', Icon: Clock, roles: ['Admin', 'Farm Manager', 'Worker'] },
  { to: '/inventory', label: 'Inventory', Icon: Package, roles: ['Admin', 'Farm Manager'] },
  { to: '/inventory/transactions', label: 'Stock In/Out', Icon: ArrowLeftRight, roles: ['Admin', 'Farm Manager'] },
  { to: '/sensors', label: 'Sensor Data', Icon: Thermometer, roles: ['Admin', 'Farm Manager', 'Worker'] },
  { to: '/reports', label: 'Reports', Icon: BarChart2, roles: ['Admin', 'Farm Manager'] },
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
            <div className="brand-title">HydroFarm</div>
            <div className="brand-sub">Management System</div>
          </div>
        </div>
        <nav>
          {NAV.filter((n) => n.roles.includes(user.role)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-item">
              <span className="nav-icon"><n.Icon size={18} /></span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">Hydroponic Farm Management System</div>
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

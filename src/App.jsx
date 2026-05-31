import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Greenhouses from './pages/Greenhouses'
import CropBatches from './pages/CropBatches'
import CropStages from './pages/CropStages'
import Workers from './pages/Workers'
import Tasks from './pages/Tasks'
import WorkHours from './pages/WorkHours'
import Inventory from './pages/Inventory'
import InventoryTransactions from './pages/InventoryTransactions'
import Sensors from './pages/Sensors'
import Reports from './pages/Reports'

const ALL = ['Admin', 'Farm Manager', 'Worker']
const MGMT = ['Admin', 'Farm Manager']

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route element={<ProtectedRoute roles={MGMT} />}>
          <Route path="/greenhouses" element={<Greenhouses />} />
          <Route path="/crop-batches" element={<CropBatches />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/transactions" element={<InventoryTransactions />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route element={<ProtectedRoute roles={ALL} />}>
          <Route path="/crop-stages" element={<CropStages />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/work-hours" element={<WorkHours />} />
          <Route path="/sensors" element={<Sensors />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guards routes by authentication and (optionally) by role.
// Use as a wrapper (children) or as a layout route (<Outlet/>).
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card">
        <h2>Access denied</h2>
        <p className="muted">
          Your role ({user.role}) does not have permission to view this page.
        </p>
      </div>
    )
  }
  return children ? children : <Outlet />
}

import { createContext, useContext, useState } from 'react'
import { users, roles } from '../data/mockData'

const AuthContext = createContext(null)

// Simulated JWT: in a real app the backend (DRF + SimpleJWT) returns this.
// Here we just base64-encode the payload so the flow looks the same.
function fakeToken(user) {
  return 'mock.' + btoa(JSON.stringify({ sub: user.id, role: user.roleId })) + '.jwt'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  function login(username, password) {
    const found = users.find(
      (u) => u.username === username && u.password === password
    )
    if (!found) return { ok: false, error: 'Invalid username or password' }
    const role = roles.find((r) => r.id === found.roleId)
    setUser({ ...found, role: role?.name })
    setToken(fakeToken(found))
    return { ok: true }
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  const value = { user, token, login, logout, isAuthenticated: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

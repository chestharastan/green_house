import { createContext, useContext, useState } from 'react'
import { users, roles } from '../data/mockData'

const AuthContext = createContext(null)
const STORAGE_KEY = 'hf_session'

function fakeToken(user) {
  return 'mock.' + btoa(JSON.stringify({ sub: user.id, role: user.roleId })) + '.jwt'
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { user: null, token: null }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const saved = loadSession()
  const [user, setUser] = useState(saved.user)
  const [token, setToken] = useState(saved.token)

  function login(username, password) {
    const found = users.find(
      (u) => u.username === username && u.password === password
    )
    if (!found) return { ok: false, error: 'Invalid username or password' }
    const role = roles.find((r) => r.id === found.roleId)
    const authed = { ...found, role: role?.name }
    const tok = fakeToken(found)
    setUser(authed)
    setToken(tok)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: authed, token: tok }))
    return { ok: true }
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = { user, token, login, logout, isAuthenticated: !!user }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

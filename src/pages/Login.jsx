import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) navigate('/')

  function submit(e) {
    e.preventDefault()
    const res = login(username.trim(), password)
    if (res.ok) navigate('/')
    else setError(res.error)
  }

  function quick(u) {
    setUsername(u)
    setPassword(u)
    const res = login(u, u)
    if (res.ok) navigate('/')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-logo"><Leaf size={36} /></span>
          <h1>SmartFarm RUPP</h1>
          <p className="muted">Hydroponic Farm Management System — RUPP</p>
        </div>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block">Sign in</button>
        </form>
        <div className="login-demo">
          <div className="muted">Demo accounts (click to sign in):</div>
          <div className="demo-buttons">
            <button className="btn btn-ghost" onClick={() => quick('admin')}>Admin</button>
            <button className="btn btn-ghost" onClick={() => quick('manager')}>Farm Manager</button>
            <button className="btn btn-ghost" onClick={() => quick('worker')}>Worker</button>
          </div>
        </div>
      </div>
    </div>
  )
}

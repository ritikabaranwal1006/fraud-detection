import { useState } from 'react'
import RoleSelect   from './pages/RoleSelect'
import CustomerPage from './pages/CustomerPage'
import AnalystPage  from './pages/AnalystPage'

export default function App() {
  const [role, setRole] = useState(null)
  if (!role)               return <RoleSelect onSelect={setRole} />
  if (role === 'customer') return <CustomerPage onBack={() => setRole(null)} />
  if (role === 'analyst')  return <AnalystPage  onBack={() => setRole(null)} />
}

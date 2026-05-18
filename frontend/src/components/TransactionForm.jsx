import { useState } from 'react'
import toast from 'react-hot-toast'
import { predictFraud } from '../api/fraudApi'

const CATEGORIES = [
  'grocery_pos','shopping_net','entertainment','gas_transport',
  'misc_net','food_dining','home','kids_pets','health_fitness',
  'personal_care','travel','shopping_pos','misc_pos',
]

const defaultForm = {
  amt: '', category: 'grocery_pos', merchant: '',
  city_pop: '', lat: '', long: '', merch_lat: '', merch_long: '',
  trans_date_trans_time: new Date().toISOString().slice(0, 16),
}

const inputStyle = {
  width: '100%', padding: '8px 10px', fontSize: '13px',
  border: '1px solid #2d3148', borderRadius: '8px',
  background: '#0f1117', color: '#e2e8f0', outline: 'none',
}
const labelStyle = { fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }

// ✅ Outside component — fixes cursor/focus bug
function Field({ label, name, type, placeholder, step, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type || 'number'} placeholder={placeholder}
        step={step} value={value} onChange={onChange} required style={inputStyle} />
    </div>
  )
}

export default function TransactionForm({ onResult }) {
  const [form, setForm]       = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        amt:      parseFloat(form.amt),
        category: form.category,
        merchant: form.merchant,
        city_pop: parseInt(form.city_pop),
        lat:      parseFloat(form.lat),
        long:     parseFloat(form.long),
        merch_lat:  parseFloat(form.merch_lat),
        merch_long: parseFloat(form.merch_long),
        trans_date_trans_time: form.trans_date_trans_time.replace('T', ' '),
      }
      const result = await predictFraud(payload)
      onResult({ ...result, ...payload, timestamp: new Date().toLocaleTimeString() })
      toast.success('Transaction analyzed!')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Backend unreachable. Is uvicorn running on :8000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>🔍 Analyze Transaction</h2>
      <div style={styles.grid}>
        <Field label="Amount ($)"      name="amt"        type="number" placeholder="249.99"    step="0.01"   value={form.amt}        onChange={handleChange} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={labelStyle}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
          </select>
        </div>
        <Field label="Merchant Name"   name="merchant"   type="text"   placeholder="e.g. Walmart"   value={form.merchant}   onChange={handleChange} />
        <Field label="City Population" name="city_pop"   type="number" placeholder="45000"           value={form.city_pop}   onChange={handleChange} />
        <Field label="Customer Lat"    name="lat"        type="number" placeholder="40.7128"  step="0.0001" value={form.lat}        onChange={handleChange} />
        <Field label="Customer Long"   name="long"       type="number" placeholder="-74.0060" step="0.0001" value={form.long}       onChange={handleChange} />
        <Field label="Merchant Lat"    name="merch_lat"  type="number" placeholder="40.7580"  step="0.0001" value={form.merch_lat}  onChange={handleChange} />
        <Field label="Merchant Long"   name="merch_long" type="number" placeholder="-73.9855" step="0.0001" value={form.merch_long} onChange={handleChange} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label style={labelStyle}>Transaction Date & Time</label>
        <input name="trans_date_trans_time" type="datetime-local"
          value={form.trans_date_trans_time} onChange={handleChange}
          required style={{ ...inputStyle, width: '100%' }} />
      </div>
      <button type="submit" disabled={loading} style={{
        ...styles.btn,
        background: loading ? '#334155' : '#3b82f6',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}>
        {loading ? 'Analyzing...' : '⚡ Analyze Transaction'}
      </button>
    </form>
  )
}

const styles = {
  form:  { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '14px', padding: '20px' },
  title: { fontSize: '15px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px' },
  grid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  btn:   { width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', color: '#fff', marginTop: '14px', transition: 'background 0.2s' },
}

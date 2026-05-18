import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import StatsCards      from '../components/StatsCards'
import TransactionForm from '../components/TransactionForm'
import ResultCard      from '../components/ResultCard'
import HistoryTable    from '../components/HistoryTable'
import Charts          from '../components/Charts'

export default function Dashboard({ onBack }) {
  const [history,    setHistory]    = useState([])
  const [lastResult, setLastResult] = useState(null)

  const handleResult = (result) => {
    setLastResult(result)
    setHistory(prev => [result, ...prev])
  }

  // Export fraud history as CSV
  const exportCSV = () => {
    if (!history.length) return
    const headers = ['Time','Amount','Merchant','Category','Is Fraud','Probability']
    const rows = history.map(h => [
      h.timestamp, h.amt, h.merchant,
      h.category, h.is_fraud ? 'FRAUD' : 'SAFE',
      (h.probability * 100).toFixed(2) + '%'
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'fraud_report.csv'; a.click()
  }

  return (
    <div style={styles.page}>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#1a1d27', color:'#e2e8f0', border:'1px solid #2d3148' } }} />

      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div>
          <h1 style={styles.h1}>🏦 Analyst Dashboard</h1>
          <p style={styles.sub}>Post-Transaction Fraud Analysis · XGBoost Classifier · FastAPI</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'10px', alignItems:'center' }}>
          {history.length > 0 && (
            <button onClick={exportCSV} style={styles.exportBtn}>
              ⬇ Export CSV
            </button>
          )}
          <div style={styles.apiBadge}>API: localhost:8000</div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards history={history} />

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        <div>
          <TransactionForm onResult={handleResult} />
          <ResultCard result={lastResult} />
        </div>
        <div style={styles.historyCard}>
          <h2 style={styles.cardTitle}>📋 Transaction History</h2>
          <HistoryTable history={history} />
        </div>
      </div>

      {/* Charts */}
      <Charts history={history} />
    </div>
  )
}

const styles = {
  page: { maxWidth:'1280px', margin:'0 auto', padding:'28px 24px', minHeight:'100vh' },
  header: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', flexWrap:'wrap' },
  h1:  { fontSize:'20px', fontWeight:'700', color:'#f1f5f9', marginBottom:'2px' },
  sub: { fontSize:'13px', color:'#64748b' },
  backBtn: { padding:'7px 14px', background:'#1a1d27', border:'1px solid #2d3148',
    borderRadius:'8px', color:'#94a3b8', cursor:'pointer', fontSize:'13px' },
  exportBtn: { padding:'7px 14px', background:'#1e3a5f', border:'1px solid #2563eb',
    borderRadius:'8px', color:'#60a5fa', cursor:'pointer', fontSize:'13px', fontWeight:'600' },
  apiBadge: { padding:'6px 14px', background:'#1a1d27', border:'1px solid #2d3148',
    borderRadius:'99px', fontSize:'12px', color:'#60a5fa', fontWeight:'500' },
  mainGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'4px' },
  historyCard: { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'14px',
    padding:'20px', overflowY:'auto', maxHeight:'640px' },
  cardTitle: { fontSize:'15px', fontWeight:'600', color:'#e2e8f0', marginBottom:'14px' },
}

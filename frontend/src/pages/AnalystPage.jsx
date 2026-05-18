import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import StatsCards      from '../components/StatsCards'
import TransactionForm from '../components/TransactionForm'
import ResultCard      from '../components/ResultCard'
import HistoryTable    from '../components/HistoryTable'
import Charts          from '../components/Charts'

export default function AnalystPage({ onBack }) {
  const [history,    setHistory]    = useState([])
  const [lastResult, setLastResult] = useState(null)

  const handleResult = (result) => {
    setLastResult(result)
    setHistory(prev => [result, ...prev])
  }

  return (
    <div style={s.page}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1d27', color: '#e2e8f0', border: '1px solid #2d3148' } }} />

      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.back}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 style={s.title}>🏦 Post-Transaction Fraud Analysis</h1>
          <p style={s.sub}>XGBoost Classifier · FastAPI /predict · Bank Analyst Dashboard</p>
        </div>
        <div style={s.badge}>API: localhost:8000/predict</div>
      </div>

      {/* Stats */}
      <StatsCards history={history} />

      {/* Main grid */}
      <div style={s.mainGrid}>
        <div>
          <TransactionForm onResult={handleResult} />
          <ResultCard result={lastResult} />
        </div>
        <div style={s.historyCard}>
          <h2 style={s.cardTitle}>📋 Transaction History</h2>
          <HistoryTable history={history} />
        </div>
      </div>

      {/* Charts */}
      <Charts history={history} />

      {/* Export button */}
      {history.length > 0 && (
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <button onClick={() => exportCSV(history)} style={s.exportBtn}>
            ⬇️ Export Fraud Report (CSV)
          </button>
        </div>
      )}
    </div>
  )
}

function exportCSV(history) {
  const headers = ['Time','Amount','Merchant','Category','Is Fraud','Probability']
  const rows = history.map(h => [
    h.timestamp, h.amt, h.merchant,
    h.category, h.is_fraud ? 'Yes' : 'No',
    (h.probability * 100).toFixed(2) + '%'
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `fraud_report_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const s = {
  page:     { maxWidth: '1280px', margin: '0 auto', padding: '28px 24px', minHeight: '100vh' },
  header:   { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  back:     { padding: '7px 14px', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' },
  title:    { fontSize: '20px', fontWeight: '700', color: '#f1f5f9' },
  sub:      { fontSize: '13px', color: '#64748b', marginTop: '3px' },
  badge:    { padding: '6px 14px', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '99px', fontSize: '12px', color: '#60a5fa', fontWeight: '500' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '4px' },
  historyCard: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '14px', padding: '20px', overflowY: 'auto', maxHeight: '620px' },
  cardTitle:   { fontSize: '15px', fontWeight: '600', color: '#e2e8f0', marginBottom: '14px' },
  exportBtn:   { padding: '8px 18px', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', color: '#60a5fa', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
}

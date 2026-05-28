import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import StatsCards      from '../components/StatsCards'
import TransactionForm from '../components/TransactionForm'
import ResultCard      from '../components/ResultCard'
import HistoryTable    from '../components/HistoryTable'
import Charts          from '../components/Charts'
import BatchUpload     from '../components/BatchUpload'
import ModelMetrics    from '../components/ModelMetrics'
import EdaInsights     from '../components/EdaInsights'

const TABS = ['🔍 Analyze', '📂 Batch Upload', '📊 Model Metrics', '📈 Data Insights']

export default function AnalystPage({ onBack }) {
  const [tab,        setTab]        = useState(0)
  const [history,    setHistory]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('analystHistory') || '[]') } catch { return [] }
  })
  const [lastResult, setLastResult] = useState(null)

  const handleResult = (result) => {
    const updated = [result, ...history]
    setLastResult(result)
    setHistory(updated)
    localStorage.setItem('analystHistory', JSON.stringify(updated.slice(0, 100)))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('analystHistory')
  }

  return (
    <div style={s.page}>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#1a1d27', color:'#e2e8f0', border:'1px solid #2d3148' } }} />

      <div style={s.header}>
        <button onClick={onBack} style={s.back}>← Back</button>
        <div style={{ flex:1 }}>
          <h1 style={s.title}>🏦 Bank Analyst Dashboard</h1>
          <p style={s.sub}>Post-Transaction Fraud Analysis · XGBoost · FastAPI</p>
        </div>
        <div style={s.apiBadge}>API: localhost:8000</div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            ...s.tab, ...(tab === i ? s.tabActive : {})
          }}>{t}</button>
        ))}
      </div>

      {/* Tab 0 — Analyze single */}
      {tab === 0 && (
        <>
          <StatsCards history={history} />
          <div style={s.mainGrid}>
            <div>
              <TransactionForm onResult={handleResult} />
              <ResultCard result={lastResult} />
            </div>
            <div style={s.historyCard}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                <h2 style={s.cardTitle}>📋 Transaction History</h2>
                {history.length > 0 && (
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => exportCSV(history)} style={s.exportBtn}>⬇️ CSV</button>
                    <button onClick={clearHistory} style={s.clearBtn}>🗑️ Clear</button>
                  </div>
                )}
              </div>
              <HistoryTable history={history} />
            </div>
          </div>
          <Charts history={history} />
        </>
      )}

      {/* Tab 1 — Batch Upload */}
      {tab === 1 && <BatchUpload />}

      {/* Tab 2 — Model Metrics */}
      {tab === 2 && <ModelMetrics />}

      {/* Tab 3 — EDA Insights */}
      {tab === 3 && <EdaInsights />}
    </div>
  )
}

function exportCSV(history) {
  const headers = ['Time','Amount','Merchant','Category','Is Fraud','Probability']
  const rows    = history.map(h => [
    h.timestamp, h.amt, h.merchant, h.category,
    h.is_fraud ? 'Yes' : 'No', (h.probability * 100).toFixed(2) + '%'
  ])
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type:'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `fraud_report_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

const s = {
  page:     { maxWidth:'1280px', margin:'0 auto', padding:'28px 24px', minHeight:'100vh' },
  header:   { display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px', flexWrap:'wrap' },
  back:     { padding:'7px 14px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'8px', color:'#94a3b8', cursor:'pointer', fontSize:'13px' },
  title:    { fontSize:'20px', fontWeight:'700', color:'#f1f5f9' },
  sub:      { fontSize:'13px', color:'#64748b', marginTop:'3px' },
  apiBadge: { padding:'6px 14px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'99px', fontSize:'12px', color:'#60a5fa', fontWeight:'500' },
  tabs:     { display:'flex', gap:'4px', marginBottom:'20px', background:'#1a1d27', padding:'4px', borderRadius:'10px', border:'1px solid #2d3148', width:'fit-content' },
  tab:      { padding:'7px 16px', borderRadius:'8px', border:'none', background:'transparent', color:'#64748b', cursor:'pointer', fontSize:'13px', fontWeight:'500' },
  tabActive:{ background:'#2d3148', color:'#e2e8f0' },
  mainGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'4px' },
  historyCard:{ background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'14px', padding:'20px', overflowY:'auto', maxHeight:'620px' },
  cardTitle:{ fontSize:'15px', fontWeight:'600', color:'#e2e8f0' },
  exportBtn:{ padding:'5px 12px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'6px', color:'#60a5fa', cursor:'pointer', fontSize:'12px' },
  clearBtn: { padding:'5px 12px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'6px', color:'#f87171', cursor:'pointer', fontSize:'12px' },
}

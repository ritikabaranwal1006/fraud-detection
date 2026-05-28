import { useState, useRef } from 'react'
import { batchPredict } from '../api/fraudApi'
import toast from 'react-hot-toast'

export default function BatchUpload() {
  const [file,     setFile]     = useState(null)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const inputRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (f && f.name.endsWith('.csv')) { setFile(f); setResult(null) }
    else toast.error('Please upload a CSV file only')
  }

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a CSV file first')
    setLoading(true)
    try {
      const data = await batchPredict(file)
      setResult(data)
      toast.success(`Analyzed ${data.total} transactions!`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed. Check CSV format.')
    } finally { setLoading(false) }
  }

  const filtered = result?.results?.filter(r => {
    const matchFilter = filter === 'all' || (filter === 'fraud' && r.is_fraud) || (filter === 'safe' && !r.is_fraud)
    const matchSearch = !search || r.merchant.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  }) || []

  const exportFiltered = () => {
    const headers = ['#','Merchant','Category','Amount','DateTime','Is Fraud','Probability','Risk Level']
    const rows = filtered.map(r => [r.row_index, r.merchant, r.category, r.amt, r.trans_date_trans_time, r.is_fraud?'Yes':'No', (r.probability*100).toFixed(2)+'%', r.risk_level])
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href=url; a.download=`batch_fraud_report_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={s.wrap}>
      <h2 style={s.title}>📂 Batch CSV Upload & Analysis</h2>
      <p style={s.sub}>Upload a transaction CSV file to analyze all rows at once. Max 10,000 rows.</p>

      {/* Required columns info */}
      <div style={s.infoBox}>
        <div style={s.infoTitle}>📋 Required CSV Columns:</div>
        <div style={s.colGrid}>
          {['merchant','category','amt','city_pop','lat','long','merch_lat','merch_long','trans_date_trans_time'].map(c => (
            <span key={c} style={s.colTag}>{c}</span>
          ))}
        </div>
        <div style={{ fontSize:'11px', color:'#475569', marginTop:'8px' }}>
          💡 Tip: Your fraudTrain.csv already has all required columns!
        </div>
      </div>

      {/* Upload area */}
      <div style={s.uploadArea} onClick={() => inputRef.current.click()}>
        <input ref={inputRef} type="file" accept=".csv" onChange={handleFile} style={{ display:'none' }} />
        <div style={{ fontSize:'36px', marginBottom:'8px' }}>📁</div>
        <div style={{ fontSize:'14px', color: file ? '#60a5fa' : '#64748b', fontWeight:'500' }}>
          {file ? `✅ ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)` : 'Click to select CSV file'}
        </div>
        {!file && <div style={{ fontSize:'12px', color:'#334155', marginTop:'4px' }}>or drag and drop</div>}
      </div>

      <button onClick={handleUpload} disabled={!file || loading} style={{
        ...s.btn,
        background: (!file || loading) ? '#334155' : '#3b82f6',
        cursor: (!file || loading) ? 'not-allowed' : 'pointer',
      }}>
        {loading ? '⏳ Analyzing all transactions...' : '⚡ Run Fraud Detection'}
      </button>

      {/* Summary cards */}
      {result && (
        <>
          <div style={s.summaryGrid}>
            <div style={s.sumCard}><div style={s.sumVal}>{result.total}</div><div style={s.sumLbl}>Total Analyzed</div></div>
            <div style={{...s.sumCard, borderColor:'#22c55e'}}><div style={{...s.sumVal, color:'#22c55e'}}>{result.safe_count}</div><div style={s.sumLbl}>Safe</div></div>
            <div style={{...s.sumCard, borderColor:'#ef4444'}}><div style={{...s.sumVal, color:'#ef4444'}}>{result.fraud_count}</div><div style={s.sumLbl}>Fraud Detected</div></div>
            <div style={{...s.sumCard, borderColor:'#f59e0b'}}><div style={{...s.sumVal, color:'#f59e0b'}}>{result.fraud_rate}%</div><div style={s.sumLbl}>Fraud Rate</div></div>
          </div>

          {/* Filters + Export */}
          <div style={s.filterRow}>
            <div style={{ display:'flex', gap:'6px' }}>
              {['all','fraud','safe'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...s.filterBtn,
                  background: filter===f ? '#2d3148' : 'transparent',
                  color: filter===f ? '#e2e8f0' : '#64748b',
                }}>
                  {f === 'all' ? `All (${result.total})` : f === 'fraud' ? `🔴 Fraud (${result.fraud_count})` : `🟢 Safe (${result.safe_count})`}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <input placeholder="Search merchant / category..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...s.searchInput }} />
              <button onClick={exportFiltered} style={s.exportBtn}>⬇️ Export CSV</button>
            </div>
          </div>

          {/* Results table */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>{['#','Merchant','Category','Amount','Date/Time','Risk','Probability'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((r, i) => {
                  const bc = r.is_fraud ? {bg:'#450a0a',color:'#fca5a5'} : r.risk_level==='Medium' ? {bg:'#431407',color:'#fcd34d'} : {bg:'#052e16',color:'#86efac'}
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid #1e2235', background: r.is_fraud ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                      <td style={s.td}>{r.row_index}</td>
                      <td style={s.td}>{r.merchant}</td>
                      <td style={s.td}>{r.category.replace(/_/g,' ')}</td>
                      <td style={s.td}>${r.amt.toFixed(2)}</td>
                      <td style={s.td}>{r.trans_date_trans_time}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background:bc.bg, color:bc.color }}>
                          {r.is_fraud ? '🔴 Fraud' : r.risk_level==='Medium' ? '🟡 Medium' : '🟢 Safe'}
                        </span>
                      </td>
                      <td style={{...s.td, fontWeight:'600', color: r.is_fraud?'#fca5a5':'#86efac'}}>
                        {(r.probability*100).toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <div style={{ textAlign:'center', padding:'12px', color:'#475569', fontSize:'12px' }}>
                Showing first 200 of {filtered.length} rows. Export CSV to see all.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const s = {
  wrap:       { padding:'4px 0' },
  title:      { fontSize:'18px', fontWeight:'600', color:'#f1f5f9', marginBottom:'6px' },
  sub:        { fontSize:'13px', color:'#64748b', marginBottom:'16px' },
  infoBox:    { background:'#0f1825', border:'1px solid #1e3a5f', borderRadius:'10px', padding:'14px', marginBottom:'16px' },
  infoTitle:  { fontSize:'12px', fontWeight:'600', color:'#60a5fa', marginBottom:'8px' },
  colGrid:    { display:'flex', flexWrap:'wrap', gap:'6px' },
  colTag:     { padding:'2px 8px', background:'#1e2235', borderRadius:'4px', fontSize:'11px', color:'#94a3b8', fontFamily:'monospace' },
  uploadArea: { border:'2px dashed #2d3148', borderRadius:'12px', padding:'32px', textAlign:'center', cursor:'pointer', marginBottom:'14px', transition:'border-color 0.2s' },
  btn:        { width:'100%', padding:'11px', fontSize:'14px', fontWeight:'600', border:'none', borderRadius:'8px', color:'#fff', marginBottom:'20px', transition:'background 0.2s' },
  summaryGrid:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' },
  sumCard:    { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'10px', padding:'14px', textAlign:'center' },
  sumVal:     { fontSize:'24px', fontWeight:'700', color:'#e2e8f0' },
  sumLbl:     { fontSize:'11px', color:'#64748b', marginTop:'2px' },
  filterRow:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px' },
  filterBtn:  { padding:'6px 12px', borderRadius:'6px', border:'1px solid #2d3148', cursor:'pointer', fontSize:'12px', fontWeight:'500' },
  searchInput:{ padding:'6px 10px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'6px', color:'#e2e8f0', fontSize:'12px', width:'220px', outline:'none' },
  exportBtn:  { padding:'6px 12px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'6px', color:'#60a5fa', cursor:'pointer', fontSize:'12px' },
  tableWrap:  { overflowX:'auto', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'12px' },
  table:      { width:'100%', borderCollapse:'collapse', fontSize:'12px' },
  th:         { textAlign:'left', padding:'10px 12px', color:'#64748b', fontWeight:'500', borderBottom:'1px solid #2d3148', whiteSpace:'nowrap' },
  td:         { padding:'8px 12px', color:'#cbd5e1' },
  badge:      { display:'inline-block', padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:'600' },
}

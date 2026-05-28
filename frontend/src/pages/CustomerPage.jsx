import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { preRiskCheck } from '../api/fraudApi'

const CATEGORIES = ['Grocery Store','Online Shopping','Entertainment','Fuel / Transport','Food & Dining','Health & Fitness','Travel','Kids & Pets','Personal Care','Home & Garden','Miscellaneous']

const defaultForm = { amount:'', merchant_name:'', merchant_category:'Grocery Store', payment_method:'credit_card', city:'', is_international:false, is_new_merchant:false }

const inp = { width:'100%', padding:'9px 12px', fontSize:'13px', border:'1px solid #2d3148', borderRadius:'8px', background:'#0f1117', color:'#e2e8f0', outline:'none' }
const lbl = { fontSize:'12px', color:'#94a3b8', marginBottom:'4px', display:'block' }

function Field({ label, name, type, placeholder, value, onChange, step }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      <label style={lbl}>{label}</label>
      <input name={name} type={type||'text'} placeholder={placeholder} step={step} value={value} onChange={onChange} style={inp} />
    </div>
  )
}

function Toggle({ label, name, value, onChange, tooltip }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      <label style={lbl}>{label}</label>
      <div style={{ display:'flex', gap:'8px' }}>
        {['Yes','No'].map(opt => (
          <button key={opt} type="button" onClick={() => onChange({ target:{ name, value: opt==='Yes' } })} style={{
            flex:1, padding:'8px', fontSize:'13px', borderRadius:'8px', border:'1px solid',
            borderColor:(opt==='Yes')===value ? '#3b82f6':'#2d3148',
            background:(opt==='Yes')===value ? '#1e3a5f':'#0f1117',
            color:(opt==='Yes')===value ? '#60a5fa':'#64748b', cursor:'pointer',
          }}>{opt}</button>
        ))}
      </div>
      {tooltip && <span style={{ fontSize:'11px', color:'#475569', marginTop:'2px' }}>ℹ️ {tooltip}</span>}
    </div>
  )
}

function RiskMeter({ score }) {
  const color = score>=60 ? '#ef4444' : score>=30 ? '#f59e0b' : '#22c55e'
  return (
    <div style={{ marginTop:'8px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
        <span style={{ fontSize:'12px', color:'#94a3b8' }}>Risk Score</span>
        <span style={{ fontSize:'13px', fontWeight:'700', color }}>{score.toFixed(1)}%</span>
      </div>
      <div style={{ background:'#1e2235', borderRadius:'99px', height:'8px', overflow:'hidden' }}>
        <div style={{ width:`${score}%`, height:'100%', background:color, borderRadius:'99px', transition:'width 0.6s ease' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
        <span style={{ fontSize:'10px', color:'#22c55e' }}>Low</span>
        <span style={{ fontSize:'10px', color:'#f59e0b' }}>Medium</span>
        <span style={{ fontSize:'10px', color:'#ef4444' }}>High</span>
      </div>
    </div>
  )
}

function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'#0f1825', border:'1px solid #1e3a5f', borderRadius:'8px', marginBottom:'16px' }}>
      <span style={{ fontSize:'14px' }}>🕐</span>
      <div>
        <span style={{ fontSize:'12px', color:'#60a5fa', fontWeight:'600' }}>
          Transaction Time: {now.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'medium' })}
        </span>
        <span style={{ fontSize:'11px', color:'#475569', marginLeft:'8px' }}>(auto-detected from your device)</span>
      </div>
    </div>
  )
}

export default function CustomerPage({ onBack }) {
  const [form, setForm]       = useState(defaultForm)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Please enter a valid amount')
    if (!form.merchant_name.trim()) return toast.error('Please enter merchant name')
    if (!form.city.trim()) return toast.error('Please enter city')
    setLoading(true)
    try {
      const payload = {
        amount:            parseFloat(form.amount),
        merchant_name:     form.merchant_name,
        merchant_category: form.merchant_category,
        payment_method:    form.payment_method,
        city:              form.city,
        is_international:  form.is_international === true || form.is_international === 'true',
        is_new_merchant:   form.is_new_merchant  === true || form.is_new_merchant  === 'true',
      }
      const res = await preRiskCheck(payload)
      setResult(res)
      toast.success('Risk analysis complete!')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Backend unreachable. Is uvicorn running on :8000?')
    } finally { setLoading(false) }
  }

  const riskConfig = result ? {
    High:   { color:'#ef4444', bg:'#2d0f0f', border:'#7f1d1d', icon:'🔴' },
    Medium: { color:'#f59e0b', bg:'#2d1f0a', border:'#78350f', icon:'🟡' },
    Low:    { color:'#22c55e', bg:'#0a2016', border:'#14532d', icon:'🟢' },
  }[result.risk_level] : null

  return (
    <div style={s.page}>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#1a1d27', color:'#e2e8f0', border:'1px solid #2d3148' } }} />
      <div style={s.header}>
        <button onClick={onBack} style={s.back}>← Back</button>
        <div>
          <h1 style={s.title}>👤 Pre-Transaction Risk Checker</h1>
          <p style={s.sub}>Check if your payment is safe before making it</p>
        </div>
      </div>

      <LiveClock />

      <div style={s.grid}>
        <form onSubmit={handleSubmit} style={s.card}>
          <h2 style={s.cardTitle}>Payment Details</h2>
          <p style={s.cardSub}>Fill in your transaction details to check fraud risk</p>
          <div style={s.formGrid}>
            <Field label="Transaction Amount (₹)" name="amount" type="number" placeholder="e.g. 2500" step="0.01" value={form.amount} onChange={handleChange} />
            <Field label="Merchant / Shop Name" name="merchant_name" type="text" placeholder="e.g. Amazon, BigBazaar" value={form.merchant_name} onChange={handleChange} />
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <label style={lbl}>Merchant Category</label>
              <select name="merchant_category" value={form.merchant_category} onChange={handleChange} style={inp}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <label style={lbl}>Payment Method</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange} style={inp}>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
            <Field label="Transaction City" name="city" type="text" placeholder="e.g. Mumbai" value={form.city} onChange={handleChange} />
            <div/>
            <Toggle label="International Transaction?" name="is_international" value={form.is_international} onChange={handleChange} tooltip="Is this payment going to a merchant outside India?" />
            <Toggle label="New Merchant? (First time?)" name="is_new_merchant" value={form.is_new_merchant} onChange={handleChange} tooltip="First-time merchants are considered higher risk by fraud models." />
          </div>
          <button type="submit" disabled={loading} style={{ ...s.btn, background:loading?'#334155':'#3b82f6', cursor:loading?'not-allowed':'pointer' }}>
            {loading ? 'Analyzing Risk...' : '🔍 Check Risk Before Paying'}
          </button>
        </form>

        <div>
          {!result ? (
            <div style={s.empty}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>🛡️</div>
              <div style={{ fontSize:'15px', fontWeight:'600', color:'#475569', marginBottom:'6px' }}>No Analysis Yet</div>
              <div style={{ fontSize:'13px', color:'#334155', lineHeight:'1.6' }}>Fill in your payment details and click "Check Risk" to instantly know if your transaction is safe.</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ ...s.resultCard, background:riskConfig.bg, border:`1px solid ${riskConfig.border}` }}>
                <div style={{ fontSize:'13px', fontWeight:'700', color:riskConfig.color, marginBottom:'6px' }}>
                  {riskConfig.icon} {result.risk_level.toUpperCase()} RISK
                </div>
                <div style={{ fontSize:'20px', fontWeight:'700', color:riskConfig.color, marginBottom:'8px' }}>
                  {result.risk_level==='Low' ? 'Transaction Appears Safe' : result.risk_level==='Medium' ? 'Proceed with Caution' : 'High Risk — Do Not Proceed'}
                </div>
                <RiskMeter score={result.risk_score} />
                <div style={{ marginTop:'12px', fontSize:'13px', color:'#cbd5e1', lineHeight:'1.6' }}>{result.message}</div>
              </div>
              <div style={s.reasonsCard}>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#e2e8f0', marginBottom:'10px' }}>📋 Risk Factors</div>
                {result.reasons.map((r, i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'6px' }}>
                    <span style={{ color:result.risk_level==='Low'?'#22c55e':result.risk_level==='Medium'?'#f59e0b':'#ef4444' }}>
                      {result.risk_level==='Low'?'✓':'⚠'}
                    </span>
                    <span style={{ color:'#cbd5e1', fontSize:'13px' }}>{r}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div style={s.statMini}><div style={{ fontSize:'11px', color:'#64748b' }}>Fraud Probability</div><div style={{ fontSize:'20px', fontWeight:'700', color:riskConfig.color }}>{(result.probability*100).toFixed(1)}%</div></div>
                <div style={s.statMini}><div style={{ fontSize:'11px', color:'#64748b' }}>Risk Score</div><div style={{ fontSize:'20px', fontWeight:'700', color:riskConfig.color }}>{result.risk_score}/100</div></div>
              </div>
              <div style={s.adviceCard}>
                <div style={{ fontSize:'12px', fontWeight:'600', color:'#60a5fa', marginBottom:'6px' }}>💡 What should you do?</div>
                <div style={{ fontSize:'12px', color:'#94a3b8', lineHeight:'1.6' }}>
                  {result.risk_level==='Low' && 'You can proceed safely. Always keep your OTP private and never share it with anyone.'}
                  {result.risk_level==='Medium' && 'Verify the merchant carefully. Check if the website URL is correct and merchant is well-known.'}
                  {result.risk_level==='High' && 'Do NOT proceed. Contact your bank immediately if you are being pressured. This shows signs of fraud.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page:       { maxWidth:'1200px', margin:'0 auto', padding:'28px 24px' },
  header:     { display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px', flexWrap:'wrap' },
  back:       { padding:'7px 14px', background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'8px', color:'#94a3b8', cursor:'pointer', fontSize:'13px' },
  title:      { fontSize:'20px', fontWeight:'700', color:'#f1f5f9' },
  sub:        { fontSize:'13px', color:'#64748b', marginTop:'3px' },
  grid:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' },
  card:       { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'14px', padding:'22px' },
  cardTitle:  { fontSize:'15px', fontWeight:'600', color:'#e2e8f0', marginBottom:'4px' },
  cardSub:    { fontSize:'12px', color:'#475569', marginBottom:'16px' },
  formGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' },
  btn:        { width:'100%', padding:'10px', fontSize:'14px', fontWeight:'600', border:'none', borderRadius:'8px', color:'#fff', transition:'background 0.2s' },
  empty:      { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'14px', padding:'40px 24px', textAlign:'center', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' },
  resultCard: { borderRadius:'12px', padding:'18px' },
  reasonsCard:{ background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'12px', padding:'16px' },
  statMini:   { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'10px', padding:'12px' },
  adviceCard: { background:'#0f1825', border:'1px solid #1e3a5f', borderRadius:'10px', padding:'14px' },
}

export default function RoleSelect({ onSelect }) {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.logo}>🛡️</div>
        <h1 style={s.title}>Fraud Risk Detection System</h1>
        <p style={s.sub}>Final Year Project · XGBoost · FastAPI · React</p>
        <div style={s.grid}>
          <button style={{...s.btn, borderColor:'#3b82f6'}} onClick={() => onSelect('customer')}>
            <div style={s.icon}>👤</div>
            <div style={s.btnTitle}>Customer</div>
            <div style={s.btnDesc}>Check if a payment is safe before making it</div>
            <div style={{...s.tag, color:'#60a5fa'}}>Pre-Transaction Risk Check</div>
          </button>
          <button style={{...s.btn, borderColor:'#8b5cf6'}} onClick={() => onSelect('analyst')}>
            <div style={s.icon}>🏦</div>
            <div style={s.btnTitle}>Bank Analyst</div>
            <div style={s.btnDesc}>Analyze transactions, upload CSV, view insights</div>
            <div style={{...s.tag, color:'#a78bfa'}}>Post-Transaction Analysis</div>
          </button>
        </div>
        <div style={s.stats}>
          <div style={s.stat}><span style={s.statVal}>99.42%</span><span style={s.statLbl}>Accuracy</span></div>
          <div style={s.statDiv}/>
          <div style={s.stat}><span style={s.statVal}>99.92%</span><span style={s.statLbl}>AUC-ROC</span></div>
          <div style={s.statDiv}/>
          <div style={s.stat}><span style={s.statVal}>1.2M+</span><span style={s.statLbl}>Trained On</span></div>
          <div style={s.statDiv}/>
          <div style={s.stat}><span style={s.statVal}>XGBoost</span><span style={s.statLbl}>Model</span></div>
        </div>
      </div>
    </div>
  )
}
const s = {
  page:     { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0a0c14 0%,#0f1117 50%,#1a1d27 100%)', padding:'24px' },
  wrap:     { textAlign:'center', maxWidth:'620px', width:'100%' },
  logo:     { fontSize:'56px', marginBottom:'16px' },
  title:    { fontSize:'28px', fontWeight:'700', color:'#f1f5f9', marginBottom:'8px' },
  sub:      { fontSize:'13px', color:'#475569', marginBottom:'40px' },
  grid:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'36px' },
  btn:      { padding:'28px 20px', borderRadius:'16px', border:'1px solid', cursor:'pointer', textAlign:'left', background:'#1a1d27', transition:'transform 0.15s' },
  icon:     { fontSize:'34px', marginBottom:'12px' },
  btnTitle: { fontSize:'17px', fontWeight:'700', color:'#f1f5f9', marginBottom:'6px' },
  btnDesc:  { fontSize:'12px', color:'#94a3b8', marginBottom:'14px', lineHeight:'1.5' },
  tag:      { display:'inline-block', padding:'3px 10px', borderRadius:'99px', fontSize:'10px', fontWeight:'600', background:'#1e2235' },
  stats:    { display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', padding:'16px', background:'#1a1d27', borderRadius:'12px', border:'1px solid #2d3148' },
  stat:     { display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' },
  statVal:  { fontSize:'15px', fontWeight:'700', color:'#60a5fa' },
  statLbl:  { fontSize:'10px', color:'#475569' },
  statDiv:  { width:'1px', height:'28px', background:'#2d3148' },
}

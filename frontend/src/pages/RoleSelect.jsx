export default function RoleSelect({ onSelect }) {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🛡️</div>
        <h1 style={s.title}>Fraud Risk Detection System</h1>
        <p style={s.sub}>Select your role to continue</p>
        <div style={s.grid}>

          <button style={{ ...s.btn, ...s.customerBtn }} onClick={() => onSelect('customer')}>
            <div style={s.btnIcon}>👤</div>
            <div style={s.btnTitle}>I'm a Customer</div>
            <div style={s.btnDesc}>Check if a payment is safe before you make it</div>
            <div style={s.tag}>Pre-Transaction Risk Check</div>
          </button>

          <button style={{ ...s.btn, ...s.analystBtn }} onClick={() => onSelect('analyst')}>
            <div style={s.btnIcon}>🏦</div>
            <div style={s.btnTitle}>I'm a Bank Analyst</div>
            <div style={s.btnDesc}>Analyze completed transactions for fraud patterns</div>
            <div style={s.tag}>Post-Transaction Analysis</div>
          </button>

        </div>
        <p style={s.footer}>Powered by XGBoost · FastAPI · React</p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)',
    padding: '24px',
  },
  card: {
    textAlign: 'center', maxWidth: '600px', width: '100%',
  },
  logo: { fontSize: '52px', marginBottom: '16px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' },
  sub:   { fontSize: '14px', color: '#64748b', marginBottom: '40px' },
  grid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' },
  btn: {
    padding: '28px 20px', borderRadius: '16px', border: '1px solid #2d3148',
    cursor: 'pointer', textAlign: 'left', transition: 'transform 0.2s, border-color 0.2s',
    background: '#1a1d27',
  },
  customerBtn: { borderColor: '#3b82f6' },
  analystBtn:  { borderColor: '#8b5cf6' },
  btnIcon:  { fontSize: '32px', marginBottom: '12px' },
  btnTitle: { fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' },
  btnDesc:  { fontSize: '12px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.5' },
  tag: {
    display: 'inline-block', padding: '3px 10px',
    borderRadius: '99px', fontSize: '10px', fontWeight: '600',
    background: '#1e2235', color: '#60a5fa',
  },
  footer: { fontSize: '12px', color: '#334155' },
}

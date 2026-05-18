export default function ResultCard({ result }) {
  if (!result) return (
    <div style={styles.empty}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
      <div>Submit a transaction to see the risk analysis</div>
    </div>
  )

  const prob     = (result.probability * 100).toFixed(2)
  const risk     = result.is_fraud ? 'fraud' : result.probability > 0.3 ? 'medium' : 'safe'

  const config = {
    fraud:  { label: '🔴 FRAUD DETECTED',         bg: '#2d0f0f', border: '#7f1d1d', color: '#fca5a5', barColor: '#ef4444' },
    medium: { label: '🟡 SUSPICIOUS — REVIEW',    bg: '#2d1f0a', border: '#78350f', color: '#fcd34d', barColor: '#f59e0b' },
    safe:   { label: '🟢 TRANSACTION SAFE',       bg: '#0a2016', border: '#14532d', color: '#86efac', barColor: '#22c55e' },
  }[risk]

  return (
    <div style={{ ...styles.card, background: config.bg, border: `1px solid ${config.border}` }}>
      <div style={{ ...styles.label, color: config.color }}>{config.label}</div>
      <div style={{ ...styles.prob, color: config.color }}>
        Fraud Probability: <strong>{prob}%</strong>
      </div>
      <div style={styles.barWrap}>
        <div style={{ ...styles.bar, width: `${Math.min(prob, 100)}%`, background: config.barColor }} />
      </div>
      <div style={styles.meta}>
        💳 ${result.amt?.toFixed(2)} &nbsp;·&nbsp;
        {result.category?.replace(/_/g, ' ')} &nbsp;·&nbsp;
        {result.merchant}
      </div>
    </div>
  )
}

const styles = {
  empty: {
    marginTop: '12px',
    padding: '30px',
    textAlign: 'center',
    color: '#475569',
    fontSize: '13px',
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '14px',
  },
  card: {
    borderRadius: '12px',
    padding: '16px',
    marginTop: '12px',
  },
  label: { fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px' },
  prob:  { fontSize: '15px', marginBottom: '10px' },
  barWrap: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '99px', height: '6px',
    overflow: 'hidden', marginBottom: '10px',
  },
  bar: { height: '100%', borderRadius: '99px', transition: 'width 0.6s ease' },
  meta: { fontSize: '12px', color: '#94a3b8' },
}

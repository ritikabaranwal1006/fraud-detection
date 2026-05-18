export default function StatsCards({ history }) {
  const total      = history.length
  const fraudCount = history.filter(h => h.is_fraud).length
  const safeCount  = history.filter(h => !h.is_fraud && h.probability <= 0.3).length
  const fraudRate  = total ? ((fraudCount / total) * 100).toFixed(0) + '%' : '—'

  const cards = [
    { label: 'Total Analyzed', value: total,      sub: 'transactions',      color: '#60a5fa' },
    { label: 'Safe',           value: safeCount,  sub: 'flagged clean',     color: '#4ade80' },
    { label: 'Flagged Fraud',  value: fraudCount, sub: 'high risk alerts',  color: '#f87171' },
    { label: 'Fraud Rate',     value: fraudRate,  sub: 'of all submitted',  color: '#fb923c' },
  ]

  return (
    <div style={styles.grid}>
      {cards.map((c, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.label}>{c.label}</div>
          <div style={{ ...styles.value, color: c.color }}>{c.value}</div>
          <div style={styles.sub}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  card: {
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '12px',
    padding: '16px',
  },
  label: { fontSize: '12px', color: '#94a3b8', marginBottom: '6px' },
  value: { fontSize: '26px', fontWeight: '700', marginBottom: '2px' },
  sub:   { fontSize: '11px', color: '#64748b' },
}

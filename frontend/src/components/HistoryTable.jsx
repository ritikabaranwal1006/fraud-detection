export default function HistoryTable({ history }) {
  if (!history.length) return (
    <div style={styles.empty}>No transactions analyzed yet.</div>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {['Time', 'Amount', 'Merchant', 'Category', 'Risk', 'Probability'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => {
            const risk  = h.is_fraud ? 'fraud' : h.probability > 0.3 ? 'medium' : 'safe'
            const badge = {
              fraud:  { bg: '#450a0a', color: '#fca5a5', label: '🔴 Fraud'  },
              medium: { bg: '#431407', color: '#fcd34d', label: '🟡 Medium' },
              safe:   { bg: '#052e16', color: '#86efac', label: '🟢 Safe'   },
            }[risk]

            return (
              <tr key={i} style={{ borderBottom: '1px solid #1e2235' }}>
                <td style={styles.td}>{h.timestamp}</td>
                <td style={styles.td}>${h.amt?.toFixed(2)}</td>
                <td style={styles.td}>{h.merchant}</td>
                <td style={styles.td}>{h.category?.replace(/_/g, ' ')}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </td>
                <td style={styles.td}>{(h.probability * 100).toFixed(2)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: {
    textAlign: 'left', padding: '8px 10px',
    color: '#64748b', fontWeight: '500',
    borderBottom: '1px solid #2d3148',
  },
  td: { padding: '8px 10px', color: '#cbd5e1' },
  badge: {
    display: 'inline-block', padding: '2px 8px',
    borderRadius: '99px', fontSize: '11px', fontWeight: '600',
  },
  empty: {
    textAlign: 'center', padding: '30px',
    color: '#475569', fontSize: '13px',
  },
}
